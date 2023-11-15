import { useEffect, useRef, useState } from "react";
import { Group, Layer, Path, Stage } from "react-konva";

import { getCenter, getDistance, getOS, getViewBoxRect } from "@lib/utils";
import icons from "@icons";
import Button from "./Button";

interface Element {
  data: string;
  fill: string;
  display: number;
}

export default function MainMap({
  width = 500,
  height = 500,
  draggable = true,

  role = "web",
  fallbackColor = "#fff",
  sectionsViewbox = "0 0 0 0",
  sections = [],
}: any) {
  // utils
  const os = getOS();

  // refs
  const stageRef = useRef<any>();
  const layerRef = useRef<any>();
  const groupRefs = useRef<any[]>([]);

  // [MOBILE] refs
  const lastCenter = useRef({ x: 0, y: 0 });
  const lastDist = useRef(0);

  // states
  const [mounted, setMounted] = useState(false);

  // [DESKTOP] event methods
  const onWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (stage) {
      // get current scale
      const oldScale = stage.scaleX();

      // get pointer positions on stage
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: ((pointer?.x || 0) - stage.x()) / oldScale,
        y: ((pointer?.y || 0) - stage.y()) / oldScale,
      };

      // direction of scaling
      let direction = e.evt.deltaY > 0 ? -1 : 1;
      if (os === "Windows") direction = -direction;

      // calculate new scale and new position for stage
      const newScale = direction > 0 ? oldScale * 1.15 : oldScale / 1.15;
      const newPos = {
        x: (pointer?.x || 0) - mousePointTo.x * newScale,
        y: (pointer?.y || 0) - mousePointTo.y * newScale,
      };

      // reflect changes
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      stage.clearCache();
    }
  };
  // [MOBILE] handle when fingers start to touch
  const onTouchStart = (e: any) => {
    if (role !== "mobile") return;
    if (e.evt.touches.length === 2) {
      // Prevent the window from being moved around
      e.evt.preventDefault();
      e.evt.stopPropagation();

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      lastCenter.current = getCenter(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );

      lastDist.current = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );
    }
  };
  // [MOBILE] handle when 2 fingers move
  const onTouchMove = (e: any) => {
    if (role !== "mobile") return;
    if (e.evt.touches.length === 2) {
      // Prevent the window from being moved around
      e.evt.preventDefault();
      e.evt.stopPropagation();

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      const stage = stageRef.current;
      if (!stage) return;

      // Calculate current distance and center between fingers
      const newDist = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );
      const newCenter = getCenter(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );

      // Calculate scale based on the change in distance
      const scaleFactor = newDist / lastDist.current;
      const newScale = stage.scaleX() * scaleFactor;

      // Calculate the position of the new center point on the stage before scaling
      const stageCenterBefore = {
        x: newCenter.x - stage.x(),
        y: newCenter.y - stage.y(),
      };

      // Calculate the scaled position of the center point
      const stageCenterAfter = {
        x: stageCenterBefore.x * scaleFactor,
        y: stageCenterBefore.y * scaleFactor,
      };

      // Calculate the difference in the center position as a result of scaling
      const stageCenterDiff = {
        x: stageCenterAfter.x - stageCenterBefore.x,
        y: stageCenterAfter.y - stageCenterBefore.y,
      };

      // Adjust the stage position with the difference so the center point remains stationary
      const newPos = {
        x: stage.x() - stageCenterDiff.x,
        y: stage.y() - stageCenterDiff.y,
      };

      // Apply the new scale and position
      stage.scaleX(newScale);
      stage.scaleY(newScale);
      stage.position(newPos);
      stage.batchDraw();
      stage.clearCache();

      // Update last known distance and center point
      lastDist.current = newDist;
      lastCenter.current = newCenter;
    }
  };
  // [COMMON] render methods
  const renderSection = (section: any) => {
    if (!section) return null;
    const { elements, ticketType, isStage } = section; //  isStage, attribute, id, display

    const _onMouseEnter = (e: any) => {
      if (role === "mobile") return;
      const container = e.target?.getStage()?.container();
      const cursorType = !ticketType ? "auto" : "pointer";
      if (container) container.style.cursor = cursorType;
    };
    const _onMouseLeave = (e: any) => {
      if (role === "mobile") return;
      const container = e.target?.getStage()?.container();
      if (container) container.style.cursor = "";
    };

    return elements?.map(({ data, display, fill }: Element, key: number) => {
      if (display !== 1) return null;
      const isBg = key === 0;

      // HANDLE FILL COLOR
      let finalFillColor = "";
      // if it is the color of the bg and there is ticket type
      if (isBg && ticketType) {
        // handle the color code
        const hasHashSymbol = ticketType?.color?.includes("#");
        finalFillColor = ticketType?.color
          ? `${hasHashSymbol ? "" : "#"}${ticketType?.color}`
          : fallbackColor;
      }
      // if it is a stage
      if (isStage) finalFillColor = fill;
      // if fill color is ""
      if (!finalFillColor && !isStage) finalFillColor = fallbackColor;

      // final colors render
      const isNormalBg = isBg && !isStage;
      const finalColors = {
        fill: finalFillColor,
        stroke: isNormalBg ? fallbackColor : "",
        strokeWidth: isNormalBg ? 1.5 : 0.5,
      };

      return (
        <Group
          ref={(e) => {
            groupRefs!.current[key] = e;
          }}
          key={`sections-${key}`}
          onMouseEnter={_onMouseEnter}
          onMouseLeave={_onMouseLeave}
        >
          <Path key={key} data={data} {...finalColors} />
        </Group>
      );
    });
  };

  // [COMMON] check for hydration just to be sure
  useEffect(() => {
    if (!mounted) setMounted(true);
  }, [mounted]);
  // [COMMON] auto scale and center the all sections map
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (stage && layer) {
      // stage dimensions
      const stageW = stage.getWidth();
      const stageH = stage.getHeight();

      // all sections group dimensions
      const sectionsRect = getViewBoxRect(sectionsViewbox);

      // calculate new scale
      const newWidth = Math.min(stageW, sectionsRect.width);
      const newScale = newWidth / sectionsRect.width;

      // stage center point
      const stageCenterX = Math.floor(stageW / 2);
      const stageCenterY = Math.floor(stageH / 2);

      // all sections group center point
      const sectionsCenterX = Math.floor((sectionsRect.width / 2) * newScale);
      const sectionsCenterY = Math.floor((sectionsRect.height / 2) * newScale);

      // offsets between 2 centers
      const offsetX = stageCenterX - sectionsCenterX;
      const offsetY = stageCenterY - sectionsCenterY;

      // reflect changes on stage
      stage.position({ x: offsetX, y: offsetY });
      stage.scale({ x: newScale, y: newScale });
    }
  }, [sectionsViewbox]);
  // [MOBILE] force prevent default
  useEffect(() => {
    // function to prevent default behavior for touchmove events
    const preventDefault = (e: any) => {
      // check if it's a one-finger touch event
      if (e.touches.length === 1) e.preventDefault();
    };
    // add event listener to the document with the passive option set to false
    document.addEventListener("touchmove", preventDefault, { passive: false });
    // cleanup the event listener when the component unmounts
    return () => document.removeEventListener("touchmove", preventDefault);
  }, []);

  // if not hydrated and no sections
  if (!mounted && sections?.length === 0) return <div>No data.</div>;
  // main render
  return (
    <div
      className="map-wrapper"
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className="btn-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
        }}
      >
        {Object.entries(icons).map(
          ([, { title, icon }]) =>
            !title.includes("eye") && <Button key={title} icon={icon} />
        )}
        <Button
          icon={icons.eyeOpen.icon}
          secondIcon={icons.eyeClose.icon}
          isToggle
        />
      </div>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        draggable={draggable}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <Layer ref={layerRef}>{sections?.map(renderSection)}</Layer>
      </Stage>
    </div>
  );
}

/*
  Assume 1: user when uses for mobile will set the right role = "mobile"
*/
