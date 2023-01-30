import {PlanData} from "./PlanData";
import {Box, Icon, Stack} from "@mui/material";
import { UTF8_LARGE_GAMMA} from "../Chars";
import React from "react";
import {FilterList} from "@mui/icons-material";

export function RenderSort (props: { data: Sort }) {
    const {data: sortData} = props;

    return (<Box>
        <Stack direction="row"
               justifyContent="center"
               alignItems="center"
               spacing={1}>
            <FilterList/>
            <Box>SORT</Box>
        </Stack>
    </Box>)
}

export default class Sort extends PlanData {
    public static LABEL = "Sort";

    component(): Function {
        return RenderSort;
    }
}