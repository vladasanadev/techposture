import { storefront } from "@/lib/commerce/config";
import { json } from "@/lib/commerce/http";
export const dynamic = "force-dynamic";
export function GET() {
  return json(storefront());
}
