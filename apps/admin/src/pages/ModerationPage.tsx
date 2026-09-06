import { ShieldCheck } from "lucide-react";
import { EmptyState, PageHeader } from "../components/ui";

export function ModerationPage() {
  return (
    <>
      <PageHeader
        title="Moderation"
        description="Reserved for reports, appeals and the moderation queue."
      />
      <section className="panel moderation-panel">
        <ShieldCheck size={22} />
        <EmptyState
          title="No moderation reports yet"
          detail="Reports and appeals will appear here when the workflow is introduced."
        />
      </section>
    </>
  );
}
