export const KeywordListWithoutWhiteSpace = [
  "컬쳐랜드",
  "보리 먹인 돼지",
  "스틸북",
  "ps4",
  "ps5",
  "닌텐도",
  "imac",
  "ipad",
  "airpod",
  "크록스",
  "리튬",
  "리튬건전지",
  "문상",
  "CR123A",
  "cr123a",
  "삼겹살",
  "치킨",
  "치킨너겟",
];

export const KeywordListWithWhiteSpace = [
  "컬렉터즈 에디션",
  "apple vision pro",
  "macbook pro",
  "외장 ssd",
];

interface TitleAndExpectedKeywordList {
  title: string;
  expectedKeywordList: string[];
}

export const ExampleTitleAndExpectedKeywordList: TitleAndExpectedKeywordList[] =
  [
    {
      title:
        "ps5 [회기팜가꾸기] 스틸북 에디션 출시, 컬쳐랜드 문상신공 적용 시 최대 98,700",
      expectedKeywordList: ["ps5", "컬쳐랜드", "스틸북", "문상"],
    },
    {
      title:
        "[푸시알림대상자만한정] 보리 먹인 돼지 삼겹살 홈플특가 할인 소량풀림",
      expectedKeywordList: ["삼겹살", "보리 먹인 돼지"],
    },
    {
      title:
        "[11마존] 리튬건전지 쟁여놓으세요 cr123a(CR123A) 해외직구 관부가세면제",
      expectedKeywordList: ["cr123a", "CR123A", "리튬건전지", "리튬"],
    },
    {
      title: "[삼성공홈] 삼성 외장 ssd 낫배드 핫딜",
      expectedKeywordList: ["외장 ssd"],
    },
  ];
