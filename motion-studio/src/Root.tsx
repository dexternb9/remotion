import "./index.css";
import { BaseFormats } from "./compositions/BaseFormats";
import { CarlosAcevedoCompositions } from "./compositions/CarlosAcevedoIntro";
import { TestReelComposition } from "./compositions/TestReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <BaseFormats />
      <TestReelComposition />
      <CarlosAcevedoCompositions />
    </>
  );
};
