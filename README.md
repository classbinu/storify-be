# STORIFY
당신의 이야기, 요정의 마법  
[https://storify-fe-temp.vercel.app/](https://storify-fe-temp.vercel.app/)

## 개발 정보  
개발팀: 크래프톤 정글 3기-101호-3팀  
개발기간: 2024. 01. 11. ~ 2024. 02. 22.  

[프론트엔드 Repo는 여기를 클릭해 주세요.](https://github.com/classbinu/storify-fe)  

## 기획 의도
우리는 어릴 적 엄마나 아빠가 읽어 주는 동화를 들으며 잠에 들곤 했습니다.  
때로는 동화 속 주인공이 되는 꿈을 꾸기도 하죠.  
저희 팀은 이렇게 생각했습니다.  

**'평범하게 흘러가는 일상도 멋진 동화가 될 수 있지 않을까?'**  

동화 속 주인공이 되는 경험, 이제 꿈이 아니라 현실이 됩니다.


## 주요 기능
1. 평범한 일상을 입력하면 다음 과정을 거쳐 한 편의 동화가 생성됩니다.
- LangChain + GPT: 동화 텍스트롸 이미지 프롬프트 생성
- Stable Diffusion + LoRA: 문단별 삽화 이미지 생성
- CLOVA Voice : 문단별 TTS 음성 파일 생성

2. 생성된 책은 다음과 같이 관리됩니다.
- 내 책장: 내가 만든 동화
- 추천 책장: 열람 기록을 바탕으로 취향 알고리즘에 따른 추천 동화
- 모든 책장: 최신, 인기, 장르별 동화

## 기술 스택
### 프론트 엔드
- [Next.js](https://nextjs.org/)

### 백엔드
- [Nest.js](https://nestjs.com/)

### 인공지능
- [LangChain](https://www.langchain.com/)
- [Stable Diffusion](https://stability.ai/)
- [LoRA](https://huggingface.co/artificialguybr/CuteCartoonRedmond-V2)

### 데이터베이스
- [Mongodb](https://www.mongodb.com/ko-kr)

### 배포
- Docker
- AWS EC2
- [Mongodb Atlas](https://www.mongodb.com/ko-kr/cloud/atlas/lp/try4)


## 기술적 챌린지
### 1. 삽화를 전부 다른 사람이 그린 것 같아요.
Dalle와 같은 상용 이미지 생성 모델은 장당 50원 내외의 비용이 청구됩니다.  
무료로 사용할 수 있는 Karlo모델은 생성 품질이 떨어지고,  
실사, 일러스트, 수채화 등의 다양한 화풍이 생성되는 문제가 있었습니다.  
비용 문제 및 화풍의 일관성을 보장하기 위해 사용 이미지 생성 API 서비스가 아닌  
오픈 소스인 Stable Diffusion과 LoRA를 조합하여  
화풍의 일관성을 보장할 수 있었습니다.

### 2. (Stable Diffusion) 이미지 생성 시간이 너무 오래 걸려요.
- Apple M1 Pro, 16GB : 3분 50초
- FastAPI + Hugging Face: 11초

로컬에서 Stable Diffusion을 실행했을 때 2048 * 2048 사이즈는 스왑 메모리 영역을 15GB 이상을 차지하다가  
리소스 부족 에러로 이미지 생성에 실패했습니다.

1024 * 1024의 이미지는 생성은 되었으나 로컬 머신에서의 생성 시간이 너무 길었습니다.  
AWS GPU 서버에 Stable Diffusion을 운영할 수 있지만,  
GPU 서버 유지 비용이 높아 Huggin Face에서 일정 부분 무료로 사용할 수 있는  
Inference API를 통해 관련 이미지 생성 시간과 인프라 비용을 절감하였습니다.

### 3. 여러 장의 이미지 생성 시 시간이 너무 오래 걸려요.
생성되는 동화 1편에는 4장 이상의 이미지가 필요합니다.  
한 장의 이미지 생성에 11~12초가 걸리는데,  
최초 생성 시에는 4장 이미지 생성 시 약 50여 초가 걸렸습니다.

각각의 이미지 생성은 서로 영향을 미치지 않기 때문에 동기적으로 생성되는 이미지를 Promise로 비동기적으로 생성했을 때 4장의 이미지 생성 시간이 12초로 줄어드는 것을 확인하고, async await 구문으로 코드를 정리하여 여러 장의 이미지 생성 시간을 단축하였습니다.  

동기적으로 생성되던 이미지를 비동기적인 방식으로 바꾼 후  
4장 이상의 10장 이상의 이미지를 생성할 때도 12초 내외가 걸리는 것을 확인하였습니다.

## 개발 일정
- 2024/01/11 ~ 01/15 : 팀형성, 기획
- 2024/01/16 ~ 02/01 : MVP 개발
- 2024/02/02 ~ 02/22 : 폴리싱
- 2024/02/24 : 크래프톤 본사 최종 발표


## 팀원 소개
[민상기](https://github.com/classbinu) 팀장, BE, AI(Stable Diffusion)  
[정진환](https://github.com/JinJung0101) BE, AI(LangChain)  
[김병현](https://github.com/sirloinbh) FE, UX/UI  
[이서진](https://github.com/metamong-Hi) FE, UX/UI  
[조윤희](https://github.com/y0c0y) FE, UX/UI  


## 프로젝트 발표 동영상
추후 업로드 됩니다.

## Contact
> 서비스를 자유롭게 알려도 괜찮아요.  
> 서비스 개선을 위해 PR해 주셔도 괜찮아요.  
> 서비스에 대한 피드백, 질문은 언제든지 환영합니다.🥳  
classbinu@gmail.com
