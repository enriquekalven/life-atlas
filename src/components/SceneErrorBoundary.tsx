import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SceneErrorBoundaryProps {
  title: string;
  children: React.ReactNode;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
  resetKey: number;
}

/**
 * Catches runtime/WebGL failures inside a 3D viewport (or the whole app) and
 * renders a friendly, kid-readable fallback instead of letting React unmount
 * the entire page into a blank white screen.
 *
 * Security note: error details are intentionally NOT rendered to the UI
 * (generic message only); diagnostics stay in the developer console.
 */
export class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<SceneErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Generic developer diagnostics only — no user data is ever logged here.
    console.error(`[TerraFauna 3D] ${this.props.title} failed to render:`, error.message);
  }

  handleRetry = () => {
    this.setState((prev) => ({ hasError: false, resetKey: prev.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-center p-6"
        >
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            {this.props.title} couldn&rsquo;t start
          </h3>
          <p className="text-xs text-slate-300 max-w-sm">
            Your browser may have 3D graphics (WebGL) turned off, or something went
            wrong while drawing the scene. Try the button below, or open the atlas in
            Chrome, Edge, Firefox, or Safari with hardware acceleration enabled.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>
    );
  }
}
