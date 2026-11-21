import { Types } from "mongoose";

export type GoalCategory =
  | "Travel"
  | "Home"
  | "Kitchen"
  | "Furniture"
  | "Experience"
  | "Other";

export type GoalStatus = "active" | "completed" | "archived";

export interface ICouple {
  _id: Types.ObjectId | string;
  partnerOneName: string;
  partnerTwoName: string;
  email: string;
  mobileNumber: string;
  passwordHash: string;
  weddingDate: Date;
  profileImage?: string;
  weddingCode: string;
  profileSlug: string;
  weddingDescription: string;
  coupleStory?: string;
  showWishesPublicly: boolean;
  justCompletedGoalIds?: string[];
  isSuspended?: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
  // Multi-partner future support
  secondaryPartner?: {
    email?: string;
    mobileNumber?: string;
    passwordHash?: string;
    verified?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoal {
  _id: Types.ObjectId | string;
  coupleId: Types.ObjectId | string;
  title: string;
  description: string;
  category: GoalCategory;
  targetAmount: number; // in integer paise (₹100 = 10,000 paise)
  collectedAmount: number; // in integer paise
  image: string; // pixel icon key e.g. 'plane', 'house', 'kitchen', 'sofa', 'ring', 'heart', 'gift'
  status: GoalStatus;
  isSpotlight?: boolean;
  order: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuest {
  _id: Types.ObjectId | string;
  fullName: string;
  mobileNumber: string; // E.164 e.g. +919876543210
  email?: string;
  relationship?: string; // Friend, Relative, Colleague, etc.
  mobileVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = "created" | "pending" | "successful" | "failed";

export interface IContribution {
  _id: Types.ObjectId | string;
  coupleId: Types.ObjectId | string;
  guestId: Types.ObjectId | string;
  goalId: Types.ObjectId | string;
  amount: number; // in integer paise
  transactionId: string; // unique internal ref (e.g., TWW_TXN_...)
  paymentGatewayReference: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  paymentStatus: PaymentStatus;
  guestMessage?: string;
  thankYouSent: boolean;
  createdAt: Date;
  paidAt?: Date;
}

export interface IOTP {
  _id: Types.ObjectId | string;
  mobileNumber: string;
  hashedOTP: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  lastSentAt: Date;
}

export interface IWish {
  _id: Types.ObjectId | string;
  coupleId: Types.ObjectId | string;
  guestId: Types.ObjectId | string;
  contributionId: Types.ObjectId | string;
  message: string;
  starred: boolean;
  createdAt: Date;
}

export type AuditActorType = "couple" | "guest" | "admin" | "system";

export interface IAuditLog {
  _id: Types.ObjectId | string;
  event: string;
  actorType: AuditActorType;
  actorId?: string;
  refId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
