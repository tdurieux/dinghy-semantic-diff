import QueryPlanResult from '../model/meta/QueryPlanResult';
import { MatchPipeline } from '../../semantic-diff/match/MatchPipeline';
import { defaultDiffOptions, PlanNodeBrowserSerDes } from '../../semantic-diff/index';
import { QP_GRAMMAR } from '../model/meta/QpGrammar';
import { Comparator } from '../../semantic-diff/compare/Comparator';
import { DagEdgeTreatment } from './ParameterStore';
import { treatDagEdges } from '../components/QueryPlanDiff';

export default function computeSimilarity(
  queryPlanResults: QueryPlanResult[],
  dagEdgeTreatment: DagEdgeTreatment
): void {
  console.time('compute_sim');

  // compute similarities
  [...new Set(queryPlanResults.map((qpr) => qpr.query))].forEach((query) => {
    const qprs = queryPlanResults.filter((qpr) => qpr.query === query);

    qprs.forEach((qpr) => (qpr.similarity = new Map()));

    // compute similarity
    qprs.forEach((first, i) => {
      qprs.slice(i + 1).forEach((second) => {
        const planSerdes = new PlanNodeBrowserSerDes(QP_GRAMMAR, defaultDiffOptions);
        const plans = [first, second].map((qpr) => {
          const plan = planSerdes.transformParsedJsonObj(qpr.queryPlan);
          treatDagEdges(plan, dagEdgeTreatment);
          return plan;
        });

        // use semantic diff
        MatchPipeline.fromMode(defaultDiffOptions).execute(
          plans[0],
          plans[1],
          new Comparator(defaultDiffOptions)
        );

        // advanced similarity measure
        // compute commonality for all matched nodes and weight it by cardinality
        const commonalities: number[] = [];
        const weights: number[] = [];
        plans[0]
          .toPreOrderUnique()
          .filter((n) => n.isMatched() && !n.isLeaf())
          .forEach((n) => {
            // simple similarity measure = (# matched) / max(sizeSubtree, sizeMatchSubtree)
            const firstSet = new Set(n.toPreOrderUnique());
            const secondSet = new Set(n.getSingleMatch().toPreOrderUnique());

            let common = 0;
            for (const cand of firstSet) {
              if (cand.isMatched() && secondSet.has(cand.getSingleMatch())) {
                common++;
              }
            }

            let avgCardinality =
              (n.data.exactCardinality + n.getSingleMatch().data.exactCardinality) / 2;
            const maxSize = Math.max(firstSet.size, secondSet.size);
            const commonality = common / maxSize;

            commonalities.push(commonality);
            // weighted by size of tree (=number of operators) and importance of operators (=cardinality)
            weights.push(
              (avgCardinality === 0 ? 1 : Math.log2(avgCardinality)) * Math.log2(maxSize)
            );
          });

        let similarity = new Comparator(defaultDiffOptions).weightedAverage(
          commonalities,
          weights,
          1
        );
        first.similarity.set(second, similarity);
        second.similarity.set(first, similarity);
      });
    });
  });

  console.timeEnd('compute_sim');
}
