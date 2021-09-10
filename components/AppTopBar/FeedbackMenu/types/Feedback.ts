// region Type
export enum Type {
  Rating = "rating",
  Report = "report",
  Request = "request",
}
// endregion

// region Rating
export interface Rating {
  __type: Type.Rating;
  rating: number;
  comment: string;
}

export const rating = (rating: number, comment: string): Rating => ({
  __type: Type.Rating,
  rating,
  comment,
});
// endregion

// region Report
export interface Report {
  __type: Type.Report;
  comment: string;
}

export const report = (comment: string): Report => ({
  __type: Type.Report,
  comment,
});
// endregion

// region Request
export interface Request {
  __type: Type.Request;
  title: string;
  comment: string;
}

export const request = (title: string, comment: string): Request => ({
  __type: Type.Request,
  title,
  comment,
});
// endregion

export type Feedback = Rating | Report | Request;
