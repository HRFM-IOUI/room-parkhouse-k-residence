"use client";
import React from "react";
import TextStyleDrawer from "@/components/dashboard/TextStyleDrawer";
import MediaEmbedDrawer from "@/components/dashboard/MediaEmbedDrawer";
import ParagraphStructureDrawer from "@/components/dashboard/StructureDrawer";
import LinkEtcDrawer from "@/components/dashboard/LinkEtcDrawer";

type Props = {
  fontSize: string;
  fontFamily: string;
  handleBold: () => void;
  handleItalic: () => void;
  handleUnderline: () => void;
  handleStrike: () => void;
  handleHighlight: () => void;
  handleColorChange: (color: string) => void;
  handleHighlightColorChange: (color: string) => void;
  handleFontSizeChange: (size: string) => void;
  handleFontFamilyChange: (family: string) => void;
  handleImage: () => void;
  handleYoutube: () => void;
  handleX: () => void;
  handleGoogleMap: () => void;
  handleTable: () => void;
  handleHeading: (level: 1 | 2 | 3) => void;
  handleBulletList: () => void;
  handleOrderedList: () => void;
  handleTaskList: () => void;
  handleAlign: (type: "left" | "center" | "right" | "justify") => void;
  handleBlockquote: () => void;
  handleCodeBlock: () => void;
  handleInsertLink: () => void;
  handleUnsetLink: () => void;
  handleEditLink: () => void;
};

export default function PCABXYCorners(props: Props) {
  return (
    <>
      {/* B：右上 */}
      <div className="fixed abxy-corner abxy-corner-b">
        <button className="abxy-drawer-btn abxy-b">B</button>
        <div className="drawer-content">
          <MediaEmbedDrawer
            onImage={props.handleImage}
            onYoutube={props.handleYoutube}
            onX={props.handleX}
            onGoogleMap={props.handleGoogleMap}
            onTable={props.handleTable}
          />
        </div>
      </div>
      {/* A：右下 */}
      <div className="fixed abxy-corner abxy-corner-a">
        <button className="abxy-drawer-btn abxy-a">A</button>
        <div className="drawer-content">
          <TextStyleDrawer
            onBold={props.handleBold}
            onItalic={props.handleItalic}
            onUnderline={props.handleUnderline}
            onStrike={props.handleStrike}
            onHighlight={props.handleHighlight}
            onColorChange={props.handleColorChange}
            onHighlightColorChange={props.handleHighlightColorChange}
            onFontSizeChange={props.handleFontSizeChange}
            onFontFamilyChange={props.handleFontFamilyChange}
            fontSize={props.fontSize}
            fontFamily={props.fontFamily}
          />
        </div>
      </div>
      {/* Y：左上 */}
      <div className="fixed abxy-corner abxy-corner-y">
        <button className="abxy-drawer-btn abxy-y">Y</button>
        <div className="drawer-content">
          <LinkEtcDrawer
            onInsertLink={props.handleInsertLink}
            onUnsetLink={props.handleUnsetLink}
            onEditLink={props.handleEditLink}
            onInsertYoutube={props.handleYoutube}
            onInsertX={props.handleX}
          />
        </div>
      </div>
      {/* X：左下 */}
      <div className="fixed abxy-corner abxy-corner-x">
        <button className="abxy-drawer-btn abxy-x">X</button>
        <div className="drawer-content">
          <ParagraphStructureDrawer
            onHeading={props.handleHeading}
            onBulletList={props.handleBulletList}
            onOrderedList={props.handleOrderedList}
            onTaskList={props.handleTaskList}
            onAlign={props.handleAlign}
            onBlockquote={props.handleBlockquote}
            onCodeBlock={props.handleCodeBlock}
          />
        </div>
      </div>
    </>
  );
}
