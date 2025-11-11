import CanvasAnimation from "../components/CanvasAnimation";

export default function Page() {
  return (
    <main className="container">
      <h1 className="title">Stick Figure Animation</h1>
      <p className="subtitle">An upset stick figure; people walking with designer bags; birds flying.</p>
      <CanvasAnimation />
      <section className="help">
        <p>
          Tip: Click Start Recording to generate a WebM video of the animation. You can
          stop anytime and download the result.
        </p>
      </section>
    </main>
  );
}
