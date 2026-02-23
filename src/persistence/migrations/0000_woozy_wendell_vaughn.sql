CREATE TYPE "public"."connection_initiator" AS ENUM('FARMER', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."market_type" AS ENUM('LOCAL', 'INTERNATIONAL', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('DRAFT', 'SIGNED', 'DELIVERED', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'NEGOTIATING');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'FARMER', 'COMPANY');--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"logo_url" text,
	"industry" text NOT NULL,
	"established_year" integer NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"phone" text NOT NULL,
	"business_email" text NOT NULL,
	"website" text,
	"desired_products" jsonb NOT NULL,
	"avg_desired_quantity" text NOT NULL,
	"target_regions" jsonb NOT NULL,
	"partnership_type" text NOT NULL,
	"market_type" "market_type" NOT NULL,
	"export_countries" jsonb NOT NULL,
	"required_certifications" jsonb NOT NULL,
	"purchasing_capacity" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"farmer_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"status" "connection_status" DEFAULT 'PENDING' NOT NULL,
	"initiated_by" "connection_initiator" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "connections_farmer_id_company_id_pk" PRIMARY KEY("farmer_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "farmer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"farm_name" text NOT NULL,
	"avatar_url" text,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"phone" text NOT NULL,
	"business_email" text NOT NULL,
	"total_area_hectares" numeric NOT NULL,
	"crop_types" jsonb NOT NULL,
	"livestock_type" text,
	"avg_annual_production" text NOT NULL,
	"certifications" jsonb NOT NULL,
	"farming_methods" jsonb NOT NULL,
	"available_production_volume" text NOT NULL,
	"season_availability" jsonb NOT NULL,
	"export_capacity" boolean DEFAULT false NOT NULL,
	"logistics_capacity" boolean DEFAULT false NOT NULL,
	"long_term_contract_available" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "farmer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'FARMER' NOT NULL,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_farmer_id_farmer_profiles_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_company_id_company_profiles_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD CONSTRAINT "farmer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;