import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";

type AuditAction =
  | "CREATE_APPOINTMENT" | "CANCEL_APPOINTMENT" | "UPDATE_APPOINTMENT"
  | "CREATE_CLIENT" | "UPDATE_CLIENT" | "DELETE_CLIENT"
  | "CREATE_PAYMENT" | "REFUND_PAYMENT"
  | "UPDATE_SETTINGS" | "UPDATE_BUSINESS"
  | "INVITE_STAFF" | "REMOVE_STAFF"
  | "CREATE_SERVICE" | "UPDATE_SERVICE" | "DELETE_SERVICE"
  | "REDEEM_GIFT_CARD" | "VALIDATE_COUPON"
  // Admin actions (Fase 15)
  | "ADMIN_IMPERSONATE" | "ADMIN_SUSPEND_BUSINESS" | "ADMIN_REACTIVATE_BUSINESS"
  | "ADMIN_CHANGE_PLAN" | "ADMIN_ADD_NOTE"
  // Feature Flags (15.3)
  | "ADMIN_CREATE_FEATURE_FLAG" | "ADMIN_UPDATE_FEATURE_FLAG" | "ADMIN_DELETE_FEATURE_FLAG"
  | "ADMIN_OVERRIDE_FEATURE_FLAG"
  // Comunicaciones (15.4)
  | "ADMIN_CREATE_ANNOUNCEMENT" | "ADMIN_DELETE_ANNOUNCEMENT" | "ADMIN_CREATE_BROADCAST"
  // Soporte (15.5)
  | "ADMIN_UPDATE_TICKET";

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
