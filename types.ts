
export interface IELTSVocab {
  phrase: string;
  mainKeyword: string;
  pronunciation: string;
  meaning: string;
  vietnameseMeaning: string;
  exampleSentence: string;
  synonyms: string[];
}

export interface IELTSTopic {
  id: string;
  title: string;
  vietnameseTitle: string;
  description: string;
  commonInPart: 'Part 1' | 'Part 2' | 'Part 3' | 'Writing';
}

export type BandScore = string;

export interface AppState {
  band: BandScore;
  topics: IELTSTopic[];
  selectedTopic: IELTSTopic | null;
  vocabList: IELTSVocab[];
  isLoading: boolean;
  error: string | null;
}
