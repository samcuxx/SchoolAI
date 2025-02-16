import AssignmentDetail from "./AssignmentDetail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignmentPage({ params }: PageProps) {
  const { id } = await params;
  return <AssignmentDetail id={id} />;
}
