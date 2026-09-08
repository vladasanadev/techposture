import QuietLanding from "@/components/QuietLanding";
import { PRODUCT } from "@/lib/commerce/config";
export default function Page() {
  return <QuietLanding price={PRODUCT.price} />;
}
