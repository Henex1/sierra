import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { MockSearchResult } from "../../../lib/lab";
import { requireQuery } from "../../../lib/apiServer";
import explanationSample from "./explanationSample.json";

const searchResultsSchema = z.object({
  projectId: z.number(),
  searchPhraseId: z.number(),
});

function mockMatches() {
  const scores: {
    name: string;
    score: number;
  }[] = [
    { name: 'es_title.localized:"per applianc licens"', score: 210.5973 },
    { name: 'es_title.localized:"per applianc"', score: 143.95348 },
    { name: 'es_text.localized:"per applianc licens"', score: 131.2363 },
    { name: 'es_text.localized:"per applianc"', score: 87.43645 },
    { name: 'es_title.localized:"per"', score: 17.299545 },
    { name: 'es_title.localized:"applianc"', score: 13.328762 },
    { name: 'es_title.localized:"licens"', score: 11.491154 },
    { name: 'es_text.localized:"per"', score: 3.8000762 },
    { name: 'es_text.localized:"applianc"', score: 3.7269855 },
    { name: 'es_text.localized:"licens"', score: 3.612312 },
    { name: "Constant Scored Query", score: 0 },
  ];
  const totalScore = scores.reduce((result, item) => {
    return result + item.score;
  }, 0);

  return {
    scores,
    explanation: {
      summary:
        `${totalScore} Sum of the following:\n` +
        scores.map((item) => `\n${item.score} ${item.name}\n`).join(""),
      json: explanationSample,
    },
  };
}

function mockGetResults({
  projectId,
  searchPhraseId,
}: {
  projectId: number;
  searchPhraseId: number;
}): Promise<MockSearchResult[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        [
          {
            id: 0,
            title: `Samsung LE-46B530P7WXZG TV 116.8 cm (46") Full HD Black`,
            description: "",
            score: Math.round(Math.random() * 100),
            url: "https://example.com/products/0",
          },
          {
            id: 1,
            title: `ASUS VivoBook S14 S432FA-EB059T Notebook Silver 35.6 cm (14") 1920 x 1080 pixels 10th gen Intel® Core™ i5 8 GB LPDDR3-SDRAM 512 GB SSD Wi-Fi 5 (802.11ac) Windows 10 Home`,
            description: `14", Full HD, 1920 x 1080, Intel Core i5-10210U, 8GB LPDDR3-SDRAM, 512GB SSD, Intel UHD Graphics, WLAN, Webcam, Windows 10 Home`,
            score: Math.round(Math.random() * 100),
            url:
              "https://www.google.com/search?q=product+1&safe=strict&ei=JRuJYLm3N4v_9QPkwJFg&oq=product+1&gs_lcp=Cgdnd3Mtd2l6EAMyCgguELEDEAoQkwIyBAgAEAoyBAgAEAoyBAguEAoyBAguEAoyBAgAEAoyBAgAEAoyBAgAEAoyBAgAEAoyBAgAEAo6BAgAEEM6BQgAELEDOggIABCxAxCDAToCCAA6BQgAEJECOgcILhCxAxBDOgsILhCxAxDHARCjAjoLCC4QsQMQkQIQkwI6BQguELEDUObJIliv1SJg8dYiaABwAngAgAH5AYgB_weSAQU3LjIuMZgBAKABAaoBB2d3cy13aXrAAQE&sclient=gws-wiz&ved=0ahUKEwj53fyTwaDwAhWLf30KHWRgBAwQ4dUDCA4&uact=5",
          },
          {
            id: 2,
            title: `ASUS Booksize V7-P7H55E PC/workstation barebone Mini-Tower Black LGA 1156 (Socket H)`,
            description: `V7-P7H55E, H55, DDR3, LGA 1156, DX10`,
            score: Math.round(Math.random() * 100),
            url: "https://example.com/products/2",
          },
          {
            id: 3,
            title: `Lenovo Legion T730 9th gen Intel® Core™ i9 i9-9900K 32 GB DDR4-SDRAM 1000 GB SSD Tower Black PC Windows 10 Home`,
            description: `Intel Core i9-9900K (16MB Cache, 3.6GHz), 32GB DDR4-SDRAM, 1000GB SSD, DVD±RW, Intel UHD Graphics 630, NVIDIA GeForce RTX 2080 SUPER (8GB), LAN, WLAN, Bluetooth, Windows 10 Home 64-bit`,
            score: Math.round(Math.random() * 100),
            url: "https://example.com/products/3",
          },
          {
            id: 4,
            title: `C2G RJ45/DB9M Modular Adapter Red`,
            description: "RJ45/DB9M Modular Adapter",
            score: Math.round(Math.random() * 100),
            url: "https://example.com/products/4",
          },
        ].map((item) => ({ ...item, matches: mockMatches() }))
      );
    }, 1500);
  });
}

export default async function getSearchResults(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const input = requireQuery(req, searchResultsSchema, (query) => ({
    projectId: parseInt(query.projectId as string),
    searchPhraseId: parseInt(query.searchPhraseId as string),
  }));

  return res.status(200).json(
    await mockGetResults({
      projectId: input.projectId,
      searchPhraseId: input.searchPhraseId,
    })
  );
}
