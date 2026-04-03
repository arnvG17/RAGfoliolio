import RaceTrackStack from "./RaceTrackStack";

const Stack = () => {
  return (
    <section id="stack" className="w-full h-full relative overflow-hidden">
      {/* RaceTrack fills the entire panel */}
      <div className="w-full h-full">
        <RaceTrackStack />
      </div>
    </section>
  );
};

export default Stack;