import React from 'react';

interface ExampleCardProps {
  title: string;
  children: React.ReactNode;
}

export function ExampleCard({ title, children }: ExampleCardProps) {
  return (
    <div className="example-card">
      <h2 className="example-card-title">{title}</h2>
      <div className="example-card-content">{children}</div>
    </div>
  );
}
