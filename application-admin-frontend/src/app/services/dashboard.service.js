import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_DOMAIN_ADMIN } from "../../data/constants";

// Define a service using a base URL and expected endpoints
const ENDPOINT = API_DOMAIN_ADMIN;

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: ENDPOINT,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            return headers;
        },
    }),
    endpoints: (builder) => ({
        getDashboardData: builder.query({
            query: () => "dashboard"
        }),
        getRevenueByMovie: builder.query({
            query: ({ startDate, endDate }) => {
                let params = {};
                if (startDate) {
                    params.startDate = startDate;
                }
                if (endDate) {
                    params.endDate = endDate;
                }
                return {
                    url: `revenue/movie`,
                    method: "GET",
                    params
                }

            }
        }),
        getRevenueByCinema: builder.query({
            query: ({ startDate, endDate }) => {
                let params = {};
                if (startDate) {
                    params.startDate = startDate;
                }
                if (endDate) {
                    params.endDate = endDate;
                }
                return {
                    url: `revenue/cinema`,
                    method: "GET",
                    params
                }

            }
        }),
        exportRevenueByMovie: builder.query({
            query: ({ startDate, endDate }) => {
                let params = {};
                if (startDate) {
                    params.startDate = startDate;
                }
                if (endDate) {
                    params.endDate = endDate;
                }
                return {
                    url: `revenue/movie/export`,
                    method: "GET",
                    params,
                    responseHandler: "blob"
                }
            }
        }),
        exportRevenueByCinema: builder.query({
            query: ({ startDate, endDate }) => {
                let params = {};
                if (startDate) {
                    params.startDate = startDate;
                }
                if (endDate) {
                    params.endDate = endDate;
                }
                return {
                    url: `revenue/cinema/export`,
                    method: "GET",
                    params,
                    responseHandler: "blob"
                }
            }
        })
    }),

});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
    useGetDashboardDataQuery,
    useGetRevenueByMovieQuery,
    useGetRevenueByCinemaQuery,
    useLazyGetRevenueByCinemaQuery,
    useLazyGetRevenueByMovieQuery,
    useLazyExportRevenueByCinemaQuery,
    useLazyExportRevenueByMovieQuery
} = dashboardApi;
