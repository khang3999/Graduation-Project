import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { View } from "react-native";

export default function DetailPointSkeleton() {
  return (
    <View>
      {/* Title Placeholder */}
      <ContentLoader
        viewBox="0 0 420 30"
        height={30}
        width={400}
        backgroundColor="#e0e0e0"
        foregroundColor="#c7c7c7"
      >
        <Rect x="20" y="10" rx="4" ry="4" width="360" height="20" />
      </ContentLoader>

      {/* Image Placeholder */}
    <ContentLoader
      viewBox="0 0 400 200"
      height={200}
      width={380}
      backgroundColor="#e0e0e0"
      foregroundColor="#c7c7c7"
    >
      <Rect x="0" y="0" rx="8" ry="8" width="400" height="200" />
    </ContentLoader>

      {/* Title Placeholder */}
      <ContentLoader
        viewBox="0 0 420 30"
        height={30}
        width={400}
        backgroundColor="#e0e0e0"
        foregroundColor="#c7c7c7"
      >
        <Rect x="20" y="10" rx="4" ry="4" width="360" height="20" />
      </ContentLoader>

      {/* Time and Address Placeholder */}
      <ContentLoader
        viewBox="0 0 420 100"
        height={100}
        width={400}
        backgroundColor="#e0e0e0"
        foregroundColor="#c7c7c7"
      >
        {/* Start Time */}
        <Rect x="20" y="10" rx="4" ry="4" width="150" height="20" />
        {/* End Time */}
        <Rect x="220" y="10" rx="4" ry="4" width="150" height="20" />
        {/* Address */}
        <Rect x="20" y="50" rx="4" ry="4" width="360" height="20" />
      </ContentLoader>
    </View>
  );
}
