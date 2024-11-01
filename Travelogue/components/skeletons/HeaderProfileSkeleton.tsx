import React from "react";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { View } from "react-native";

export default function HeaderProfileSkeleton() {
  return (
    <>
      <ContentLoader
        viewBox="0 0 400 70"
        height={50}
        width={400}
        backgroundColor="#e0e0e0"
        foregroundColor="#c7c7c7"
      >
        <Rect x="250" y="60" rx="4" ry="4" width="254" height="7" />
      </ContentLoader>
      <ContentLoader
        viewBox="0 0 400 70"
        height={160}
        width={400}
        backgroundColor="#D9D9D9"
      >
        <Rect x="110" y="21" rx="4" ry="4" width="254" height="6" />
        <Rect x="111" y="41" rx="3" ry="3" width="185" height="7" />
        <Rect x="304" y="-46" rx="3" ry="3" width="350" height="6" />
        <Rect x="371" y="-45" rx="3" ry="3" width="380" height="6" />
        <Rect x="484" y="-45" rx="3" ry="3" width="201" height="6" />
        <Circle cx="48" cy="48" r="48" />
      </ContentLoader>
    </>
  );
}
