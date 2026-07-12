import { randomUUID } from 'node:crypto'
import express, { type Request, type Response } from 'express'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { lorryReceiptsTable } from '../db/schema.js'
import { authenticateRequest, authorizeRoles } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../lib/http.js'

function escapePdfText(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}

function buildSimplePdf(lines: string[]) {
  const content = [`BT`, `/F1 12 Tf`, `72 760 Td`]
  lines.forEach((line, index) => {
    if (index === 0) {
      content.push(`(${escapePdfText(line)}) Tj`)
    } else {
      content.push(`0 -16 Td (${escapePdfText(line)}) Tj`)
    }
  })
  content.push('ET')

  const objects: string[] = []
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>'
  const stream = content.join('\n')
  objects[4] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let index = 1; index <= 5; index += 1) {
    offsets[index] = Buffer.byteLength(pdf)
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`
  }
  const xrefOffset = Buffer.byteLength(pdf)
  pdf += `xref\n0 6\n0000000000 65535 f \n`
  for (let index = 1; index <= 5; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, 'utf8')
}

export const receiptsRouter = express.Router()

receiptsRouter.use(authenticateRequest)

receiptsRouter.get(
  '/',
  asyncHandler(async (_request: Request, response: Response) => {
    const receipts = await db.select().from(lorryReceiptsTable)
    response.json({ receipts })
  }),
)

receiptsRouter.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  asyncHandler(async (request: Request, response: Response) => {
    const payload = request.body as Record<string, string | number | undefined>
    if (!payload.consignorName || !payload.consigneeName || !payload.goodsDescription || !payload.freightAmount || !payload.paymentType) {
      throw new ApiError('Missing required receipt fields', 400)
    }

    const id = `LR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const [receipt] = await db.insert(lorryReceiptsTable).values({
      id,
      vehicleNo: String(payload.vehicleNo ?? ''),
      driverName: String(payload.driverName ?? ''),
      driverPhone: String(payload.driverPhone ?? ''),
      consignorName: String(payload.consignorName),
      consignorGstin: String(payload.consignorGstin ?? ''),
      consignorAddress: String(payload.consignorAddress ?? ''),
      consigneeName: String(payload.consigneeName),
      consigneeGstin: String(payload.consigneeGstin ?? ''),
      consigneeAddress: String(payload.consigneeAddress ?? ''),
      goodsDescription: String(payload.goodsDescription),
      packagingType: String(payload.packagingType ?? 'General'),
      actualWeight: Number(payload.actualWeight ?? 0),
      chargedWeight: Number(payload.chargedWeight ?? 0),
      freightAmount: String(payload.freightAmount),
      hamaliCharges: String(payload.hamaliCharges ?? '0'),
      demurrageCharges: String(payload.demurrageCharges ?? '0'),
      otherCharges: String(payload.otherCharges ?? '0'),
      paymentType: payload.paymentType as 'To Pay' | 'Paid' | 'TBB (To Be Billed)',
    }).returning()

    response.status(201).json({ receipt })
  }),
)

receiptsRouter.get(
  '/:id/pdf',
  asyncHandler(async (request: Request, response: Response) => {
    const receiptId = String(request.params.id)
    const [receipt] = await db.select().from(lorryReceiptsTable).where(eq(lorryReceiptsTable.id, receiptId)).limit(1)
    if (!receipt) throw new ApiError('Receipt not found', 404)
    const lines = [
      'AxisFleet Logistics',
      `Receipt ID: ${receiptId}`,
      'Professional transport document',
    ]
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename="${receiptId}.pdf"`)
    response.send(buildSimplePdf(lines))
  }),
)