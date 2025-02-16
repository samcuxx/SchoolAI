import AssignmentDetail from "./AssignmentDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AssignmentPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);
  return <AssignmentDetail id={id} />;
}
