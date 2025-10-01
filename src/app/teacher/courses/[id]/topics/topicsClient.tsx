"use client";

import { useState } from "react";
import SidebarTopics from "@/components/topics/sidebar-topics";
import NewTopicEditor from "@/components/topics/new-topic-editor";
import type { Topic } from "@/types/editor";

export default function TopicsClient({ courseId }: { courseId: string }) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]); 

  return (
    <div className="grid grid-cols-[280px_1fr]">
      <SidebarTopics
        courseId={courseId}
        activeId={activeTopicId}
        onSelect={setActiveTopicId}
      
      />
      <main className="p-4">
        <NewTopicEditor
          courseId={courseId}
          onCreated={(t) => {
            setTopics((prev) => [t, ...prev]); 
            setActiveTopicId(t.id);
          }}
        />
      </main>
    </div>
  );
}
