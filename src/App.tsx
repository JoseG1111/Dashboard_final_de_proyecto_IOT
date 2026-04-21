import { HeaderBar } from './components/layout/HeaderBar';
import { CurrentEventPanel } from './components/panels/CurrentEventPanel';
import { EventTimeline } from './components/panels/EventTimeline';
import { FlowPipeline } from './components/panels/FlowPipeline';
import { KpiGrid } from './components/panels/KpiGrid';
import { MonitoringGrid } from './components/panels/MonitoringGrid';
import { SimulationControls } from './components/panels/SimulationControls';

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_26%),linear-gradient(180deg,_#f8fafc,_#e2e8f0)]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <HeaderBar />
        <SimulationControls />
        <FlowPipeline />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <CurrentEventPanel />
          <EventTimeline />
        </div>
        <MonitoringGrid />
        <KpiGrid />
      </div>
    </div>
  );
}

