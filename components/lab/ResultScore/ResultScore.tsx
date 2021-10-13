import React, { useState } from "react";

import { apiRequest } from "../../../lib/api";
import { ExposedSearchPhrase, MockSearchResult } from "../../../lib/lab";
import { ExposedVote } from "../../../lib/judgements";
import { ResultScorePopover } from "./ResultScorePopover";
import { VoteScores } from "./VoteScores";

type ResultScoreProps = {
  result: MockSearchResult;
  searchConfigurationId?: string;
  searchPhrase: ExposedSearchPhrase;
  onChange: () => void;
};

interface ExtendedVote extends ExposedVote {
  name: string;
}

export default function ResultScore({
  result,
  searchPhrase,
  onChange,
  searchConfigurationId,
}: ResultScoreProps) {
  const [votes, setVotes] = useState<ExtendedVote[] | undefined>(undefined);

  const handleOpen = async () => {
    const { votes: newVotes } = await apiRequest(
      `/api/lab/vote/list?id=${searchPhrase.id}`,
      {
        documentId: result.id,
      }
    );

    setVotes(newVotes);
  };

  const handleClose = () => {
    setVotes(undefined);
  };

  const handleChange = () => {
    handleClose();
    onChange();
  };

  return (
    <ResultScorePopover
      onOpen={handleOpen}
      onClose={handleClose}
      score={result?.score}
    >
      <>
        {Array.isArray(votes) && [0, 1].includes(votes.length) && (
          <VoteScores
            vote={votes[0]}
            documentId={result.id}
            searchConfigurationId={searchConfigurationId}
            onChange={handleChange}
          />
        )}
        {Array.isArray(votes) && votes.length > 1 && (
          <div style={{ minWidth: 500, padding: 10 }}>
            <h2>{searchPhrase.phrase}</h2>
            {votes?.map((vote, index) => (
              <div key={index}>
                <h4>
                  <ResultScorePopover
                    score={vote.score}
                    onClose={handleClose}
                    id="multiple-result-score-popover"
                  >
                    <VoteScores
                      vote={vote}
                      onChange={handleChange}
                      documentId={result.id}
                      searchConfigurationId={searchConfigurationId}
                    />
                  </ResultScorePopover>
                  {vote.name}
                </h4>
              </div>
            ))}
          </div>
        )}
      </>
    </ResultScorePopover>
  );
}
