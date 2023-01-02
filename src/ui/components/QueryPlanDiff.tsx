import React from 'react';
// @ts-ignore
import s from './QueryPlanDiff.module.scss';
import TwoWayDiffView from "./view/diff/TwoWayDiffView";
import UnifiedTreeView from "./view/unified/UnifiedTreeView";
import {defaultDiffOptions, PlanNodeBrowserSerDes} from "../../semantic-diff";
import {qpGrammar} from "../data/plans";
import UnifiedTreeGenerator
    from "../../semantic-diff/delta/UnifiedTreeGenerator";
import {PlanData} from "../model/PlanData";
import QueryPlanResultDiff from "./QueryPlanResultDiff";
import {Stack} from "@mui/material";
import {useQueryPlanState} from "../data/QueryPlanResultStore";
import {useParameterState} from "../data/Store";


/**
 * Root Component for QueryPlan diff view
 */
export default function QueryPlanDiff () {

    const [state, actions] = useQueryPlanState();
    const [parameters, parameterActions] = useParameterState();

    const firstPlanResult = state.queryPlanResults[state.firstSelection];
    const secondPlanResult = state.queryPlanResults[state.secondSelection];

    const planSerdes = new PlanNodeBrowserSerDes(qpGrammar, defaultDiffOptions);
    const firstPlan = planSerdes.parseFromString(firstPlanResult.queryPlanXml);
    const secondPlan = planSerdes.parseFromString(secondPlanResult.queryPlanXml);

    return (

        <Stack direction="column"
               height="inherit"
               width="inherit">
            <QueryPlanResultDiff firstPlanResult={firstPlanResult}
                                 secondPlanResult={secondPlanResult}></QueryPlanResultDiff>
            {
                parameters.showUnified
                    ? <UnifiedTreeView
                        unifiedTree={new UnifiedTreeGenerator<PlanData>(
                            defaultDiffOptions).generate(
                            firstPlan,
                            secondPlan)}
                        hideNodes={parameters.hideNodes}/>
                    : <TwoWayDiffView firstPlan={firstPlan}
                                      secondPlan={secondPlan}
                                      showMatches={parameters.showMatches}/>
            }
        </Stack>
    );
}

/**
 * What is this for? -> Wraps the component in an AppContextConsumer that injects the appContext (store root state)
 * and takes in a function to generate component props from store state.
 */
//export default withAppContext(connect((state: Store.RootState) => ({}))(QueryPlanDiff));
