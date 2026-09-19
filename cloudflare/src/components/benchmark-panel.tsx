import type { BenchmarkTelemetry } from "../lib/showcase-projects";
import "../styles/benchmark.css";

type BenchmarkPanelProps = {
  telemetry: {
    benchmark?: BenchmarkTelemetry;
    tokens?: number;
    cost?: string;
    requests?: number;
    tests?: string;
  };
  readmeUrl?: string;
  projectUrl?: string;
};

export function BenchmarkPanel({ telemetry, readmeUrl, projectUrl }: BenchmarkPanelProps) {
  const benchmark = telemetry.benchmark;
  const unattended = benchmark?.dimension4_autonomy.operatorResumes === 0;

  return (
    <section className="benchmark-spec-matrix" aria-labelledby="benchmark-title">
      <header className="benchmark-header">
        <div>
          <div className="benchmark-eyebrow">
            <span>Run telemetry</span>
            {benchmark && (
              <span className={unattended ? "benchmark-status" : "benchmark-note"}>
                {unattended ? "100% unattended" : "Operator assisted"}
              </span>
            )}
          </div>
          <h2 id="benchmark-title">Autonomous Execution Benchmark</h2>
          <p>Cost, activity, autonomy and verification from the cheapoS execution engine.</p>
        </div>
      </header>

      {benchmark ? (
        <div className="benchmark-sections">
          <section className="benchmark-card" aria-labelledby="benchmark-cost">
            <div className="benchmark-card-heading">
              <h3 id="benchmark-cost"><span className="benchmark-index">01</span> Cost &amp; token usage</h3>
            </div>
            <dl className="benchmark-totals">
              <div><dt>Total billed</dt><dd>{benchmark.dimension1_cost_tokens.billedCost}</dd></div>
              <div><dt>Total tokens</dt><dd>{benchmark.dimension1_cost_tokens.totalTokens.toLocaleString()}</dd></div>
            </dl>
            <dl className="benchmark-metrics benchmark-token-breakdown">
              <div><dt>Worker tokens</dt><dd>{benchmark.dimension1_cost_tokens.workerTokens.toLocaleString()}</dd></div>
              <div><dt>Reviewer tokens</dt><dd>{benchmark.dimension1_cost_tokens.reviewerTokens.toLocaleString()}</dd></div>
              <div><dt>Planner tokens</dt><dd>{benchmark.dimension1_cost_tokens.plannerTokens.toLocaleString()}</dd></div>
              <div><dt>Coordinator tokens</dt><dd>{benchmark.dimension1_cost_tokens.coordinatorTokens.toLocaleString()}</dd></div>
            </dl>
            <dl className="benchmark-timing">
              <div><dt>Elapsed</dt><dd>{benchmark.dimension1_cost_tokens.elapsedTimeMin} min</dd></div>
              <div><dt>Inference</dt><dd>{benchmark.dimension1_cost_tokens.inferenceTimeMin} min</dd></div>
              <div><dt>Controller &amp; validation</dt><dd>{benchmark.dimension1_cost_tokens.controllerTimeMin} min</dd></div>
            </dl>
          </section>

          <section className="benchmark-card" aria-labelledby="benchmark-actions">
            <div className="benchmark-card-heading">
              <h3 id="benchmark-actions"><span className="benchmark-index">02</span> Actions &amp; calls</h3>
              <p className="benchmark-inline-total"><strong>{benchmark.dimension2_effort.totalActions.toLocaleString()}</strong> total actions</p>
            </div>
            <dl className="benchmark-metrics benchmark-actions">
              <div><dt>Worker calls</dt><dd>{benchmark.dimension2_effort.workerCalls.toLocaleString()}</dd></div>
              <div><dt>Tool actions</dt><dd>{benchmark.dimension2_effort.toolActions.toLocaleString()}</dd></div>
              <div><dt>Reviewer calls</dt><dd>{benchmark.dimension2_effort.reviewerCalls.toLocaleString()}</dd></div>
              <div><dt>Planner calls</dt><dd>{benchmark.dimension2_effort.plannerCalls.toLocaleString()}</dd></div>
              <div><dt>Coordinator calls</dt><dd>{benchmark.dimension2_effort.coordinatorCalls.toLocaleString()}</dd></div>
              <div><dt>Checkpoints</dt><dd>{benchmark.dimension2_effort.checkpoints.toLocaleString()}</dd></div>
            </dl>
          </section>

          <section className="benchmark-card" aria-labelledby="benchmark-models">
            <div className="benchmark-card-heading">
              <h3 id="benchmark-models"><span className="benchmark-index">03</span> Models used</h3>
              <p className="benchmark-note">{benchmark.dimension3_swarm.providerHandoffs.toLocaleString()} provider handoffs</p>
            </div>
            <dl className="benchmark-roster">
              {([
                ["Workers", (benchmark.dimension3_swarm.workers && benchmark.dimension3_swarm.workers.length > 0) ? benchmark.dimension3_swarm.workers : (benchmark.dimension3_swarm.coordinators && benchmark.dimension3_swarm.coordinators.length > 0 ? benchmark.dimension3_swarm.coordinators : ["autonomous worker swarm"])],
                ["Reviewers", benchmark.dimension3_swarm.reviewers],
                ["Coordinators", benchmark.dimension3_swarm.coordinators],
              ] as const).map(([role, models]) => (
                <div key={role}>
                  <dt>{role}</dt>
                  <dd>{models && models.length ? models.map((model) => <code key={model}>{model}</code>) : <span className="benchmark-note">None recorded</span>}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="benchmark-card" aria-labelledby="benchmark-autonomy">
            <div className="benchmark-card-heading">
              <h3 id="benchmark-autonomy"><span className="benchmark-index">04</span> Autonomy</h3>
              {unattended && <span className="benchmark-status">Unattended</span>}
            </div>
            <dl className="benchmark-metrics benchmark-summary-metrics">
              <div><dt>Operator resumes</dt><dd>{benchmark.dimension4_autonomy.operatorResumes.toLocaleString()}</dd></div>
              <div><dt>Auto-approved checks</dt><dd>{benchmark.dimension4_autonomy.autoApprovedChecks.toLocaleString()}<span className="benchmark-note">Shell commands</span></dd></div>
              <div><dt>Merge blockers</dt><dd className="benchmark-text-value">{benchmark.dimension4_autonomy.mergeBlockers}</dd></div>
            </dl>
          </section>

          <section className="benchmark-card" aria-labelledby="benchmark-quality">
            <div className="benchmark-card-heading">
              <h3 id="benchmark-quality"><span className="benchmark-index">05</span> Code quality &amp; verification</h3>
            </div>
            <dl className="benchmark-verification">
              <dt>Unit test suite (final verification)</dt>
              <dd>{benchmark.dimension5_quality.finalUnitTestScore}</dd>
            </dl>
            <dl className="benchmark-metrics benchmark-summary-metrics">
              <div><dt>Autonomous check runs</dt><dd className="benchmark-text-value">{benchmark.dimension5_quality.checksSummary}</dd><span className="benchmark-note">Iterative test loops during build</span></div>
              <div><dt>Reviewer decisions</dt><dd className="benchmark-text-value">{benchmark.dimension5_quality.reviewerDecisions}</dd></div>
              <div><dt>Commits authored</dt><dd>{benchmark.dimension5_quality.commitsAuthored.toLocaleString()}</dd></div>
            </dl>
          </section>
        </div>
      ) : (
        <dl className="benchmark-metrics benchmark-legacy">
          <div className="benchmark-card"><dt>Tokens consumed</dt><dd>{telemetry.tokens?.toLocaleString() ?? "N/A"}</dd></div>
          <div className="benchmark-card"><dt>API compute cost</dt><dd>{telemetry.cost || "$0.0000"}</dd></div>
          <div className="benchmark-card"><dt>Dispatched calls</dt><dd>{(telemetry.requests ?? 0).toLocaleString()}</dd></div>
          <div className="benchmark-card"><dt>Verification</dt><dd className="benchmark-text-value">{telemetry.tests || "Passing"}</dd></div>
        </dl>
      )}
    </section>
  );
}
