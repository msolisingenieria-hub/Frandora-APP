import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";

type AuditAction =
  | "CREATE_APPOINTMENT" | "CANCEL_APPOINTMENT" | "UPDATE_APPOINTMENT"
  | "CREATE_CLIENT" | "UPDATE_CLIENT" | "DELETE_CLIENT"
  | "CREATE_PAYMENT" | "REFUND_PAYMENT"
  | "UPDATE_SETTINGS" | "UPDATE_BUSINESS"
  | "INVITE_STAFF" | "REMOVE_STAFF"
  | "CREATE_SERVICE" | "UPDATE_SERVICE" | "DELETE_SERVICE"
  | "REDEEM_GIFT_CARD" | "VALIDATE_COUPON";

interface AuditParams {
  businessId?: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function audit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params });
  } catch {
    // El audit log nunca debe romper el flujo principal
  }
}
