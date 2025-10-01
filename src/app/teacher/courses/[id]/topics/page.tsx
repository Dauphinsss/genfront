import TopicsClient from "./topicsClient";

interface PageProps {
  params: { courseId: string };
}

export default function TopicsPage({ params }: PageProps) {
  const { courseId } = params;

  return <TopicsClient courseId={courseId} />;
}
