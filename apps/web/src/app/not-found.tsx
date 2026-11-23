import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#101827] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#172D43] border border-[#2A4365] flex items-center justify-center mb-6 text-[#22D3EE] shadow-lg shadow-[#22D3EE]/10">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-[#94A3B8] max-w-md mb-8 leading-relaxed">
        The requested resource or workflow canvas does not exist or may have been archived.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
