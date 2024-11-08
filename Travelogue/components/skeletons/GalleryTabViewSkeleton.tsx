import React from "react";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { Dimensions, View } from "react-native";

export default function GalleryTabViewSkeleton() {
  // Hardcoded values\
  const columns = 3;
  const padding = 4;
  const { width } = Dimensions.get("window");
  const itemSize = (width - padding * (columns + 1)) / columns;

  return (
    <View style={{ flex: 2.3, padding: padding }}>
      <ContentLoader
        width={width}
        height={width * 1.5}
        backgroundColor="#e0e0e0"
        foregroundColor="#c7c7c7"
        speed={1.5}
      >
       
       <Circle cx={width / 6} cy="20" r="20" /> 
       <Circle cx={width / 2} cy="20" r="20" />     
       <Circle cx={(width * 5) / 6 } cy="20" r="20" />
        
        {/* Row 1 */}
        <Rect x={padding} y={50} width={itemSize} height={itemSize} />
        <Rect x={itemSize + padding * 2} y={50} width={itemSize} height={itemSize} />
        <Rect x={(itemSize + padding) * 2 + padding} y={50} width={itemSize} height={itemSize} />
        
        {/* Row 2 */}
        <Rect x={padding} y={itemSize + padding  + 50} width={itemSize} height={itemSize} />
        <Rect x={itemSize + padding * 2} y={itemSize + padding  + 50} width={itemSize} height={itemSize} />
        <Rect x={(itemSize + padding) * 2 + padding} y={itemSize + padding + 50} width={itemSize} height={itemSize} />
        
        {/* Row 3 */}
        <Rect x={padding} y={(itemSize + padding) * 2  + 50} width={itemSize} height={itemSize} />
        <Rect x={itemSize + padding * 2} y={(itemSize + padding) * 2  + 50} width={itemSize} height={itemSize} />
        <Rect x={(itemSize + padding) * 2 + padding} y={(itemSize + padding) * 2 + 50} width={itemSize} height={itemSize} />
      </ContentLoader>
    </View>
  );
}
