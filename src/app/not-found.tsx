import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="py-20">
      <Container>
        <div className="text-center">
          <h1 className="text-6xl font-heading font-bold text-earth-300 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-heading font-bold text-earth-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-earth-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
