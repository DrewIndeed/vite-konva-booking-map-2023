/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from "react";
import { PlacesType, Tooltip } from "react-tooltip";

import { BUTTONS } from "@lib/constants";
import Button from "./Button";

type ToolTip = {
  place: PlacesType;
  content: string;
};
type Props = {
  role: "web" | "admin" | "mobile";
  tooltip: Record<string, ToolTip>;
  zoomSpeed: number;
  zoomByFactorOffset: number;
  isMinimap: boolean;
  handleReset: () => void;
  handleResetCallback: () => void;
  handleZoomByFactor: (arg0: number) => void;
  setShowMinimap: Dispatch<SetStateAction<boolean>>;
};

const Buttons = ({
  role,
  tooltip,
  zoomSpeed,
  zoomByFactorOffset,
  isMinimap,
  handleReset,
  handleResetCallback,
  handleZoomByFactor,
  setShowMinimap,
}: Props) => {
  return (
    <div
      className="btn-wrapper"
      // DO NOT TOUCH
      style={{
        display: isMinimap ? "none" : "flex",
        flexDirection: "column",
        position: "absolute",
      }}
    >
      {Object.entries(BUTTONS).map(([, { key, icon, defaultContent }]) => {
        if (key.includes("eye")) return null;
        return (
          <Button
            key={key}
            icon={icon}
            tooltip={{
              content: tooltip?.[key]?.content || defaultContent,
              place: tooltip?.[key]?.place || "",
            }}
            debounceValue={key === "reset" ? 200 : 0}
            onClick={() => {
              switch (key) {
                case "plus":
                  handleZoomByFactor(zoomSpeed * zoomByFactorOffset);
                  break;
                case "minus":
                  handleZoomByFactor(1 / (zoomSpeed * zoomByFactorOffset));
                  break;
                default:
                  handleReset();
                  handleResetCallback();
                  break;
              }
            }}
          />
        );
      })}
      {role !== "admin" && (
        <Button
          isToggle
          icon={BUTTONS.eyeOpen.icon}
          secondIcon={BUTTONS.eyeClose.icon}
          tooltip={{
            content:
              tooltip?.["eye"]?.content || BUTTONS.eyeOpen.defaultContent,
            place: tooltip?.["eye"]?.place,
          }}
          onClick={() => setShowMinimap((prev: boolean) => !prev)}
        />
      )}
      {role !== "mobile" && <Tooltip id="btn-tooltip" opacity={1} />}
    </div>
  );
};

export default Buttons;
