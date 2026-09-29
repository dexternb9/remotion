import "./index.css";
import { BaseFormats } from "./compositions/BaseFormats";
import { TestReelComposition } from "./compositions/TestReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <BaseFormats />
      <TestReelComposition />
    </>
  );
};
