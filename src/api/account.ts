// Programmed by Ayaz Ciplak
import { tokenFetch } from "./client";

/** Shape returned by /getAllOwners and /getFreeSlotOwners - mirrors UserInformation.java */
export interface OwnerInfo {
  email: string;
  firstName: string;
  lastName: string;
  owner: boolean;
  department: string;
  title: string;
}

/**
 * POST /api/account/getAllOwners
 * Returns every registered @mcgill.ca owner account (no slot filter).
 * Token sent as text/plain to avoid Spring StringHttpMessageConverter quoting issue.
 */
export const apiGetAllOwners = (token: string): Promise<OwnerInfo[]> =>
  tokenFetch("/api/account/getAllOwners", token) as Promise<OwnerInfo[]>;
