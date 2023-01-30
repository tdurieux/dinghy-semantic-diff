import {PlanData} from "./PlanData";
import {Box, Stack} from "@mui/material";
import { UTF8_LARGE_GAMMA} from "../Chars";
import React from "react";

export function RenderGroupBy (props: { data: GroupBy }) {
    const {data: groupByData} = props;

    return (<Box>
        <Stack direction="row"
               justifyContent="center"
               alignItems="center"
               spacing={1}>
            <Box>{UTF8_LARGE_GAMMA}</Box>
            <Box>GROUP BY</Box>
        </Stack>
    </Box>)
}

export default class GroupBy extends PlanData {
    public static LABEL = "GroupBy";

    component(): Function {
        return RenderGroupBy;
    }
}