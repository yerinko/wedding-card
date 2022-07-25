import { Copy, PinAlt, Heart } from "iconoir-react";
import Image from "next/image";
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import styled, { css } from "styled-components";
import useSWR from "swr";
import YouTube from "react-youtube";

import Modal from "@/components/common/Modal";
import timeDiffFormat from "@/common/utils/timeDiffFormat";
import coverPic from "@/public/photos/main.png";
import developPic from "@/public/photos/developer.png";
import hoya from "@/public/photos/hoya.png";
import yerin from "@/public/photos/yerin.png";
import mapPic from "../../../public/photos/map.png";
import mapTitle from "@/public/photos/map_title.png";
import { GetTalkListResponse, Party, Talk } from "@/talk/types";
import {
  BoxShadowStyle,
  BubbleHeadStyle,
  Main,
  SectionHeader,
  SectionHr,
  TextSansStyle,
} from "./styles";
import WriteTalk from "./talk/WriteTalk";
import EditTalk from "./talk/EditTalk";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { UpdateAction } from "react-quick-pinch-zoom/esm/PinchZoom/types";

const Header = styled.h1`
  display: inline-block;
  margin: 40px 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 2.5;
  hr {
    width: 70%;
    margin: 0 auto;
    border: 0;
    border-top: 1px solid #ccc;
  }
  .name {
    padding: 14px 24px;
    display: inline-block;
  }
`;

const TopTitle = styled.h1`
  display: inline-block;
  margin: 60px 0;
  font-size: 32px;
  font-weight: 500;
  font-family: "Rubik Mono One", sans-serif;
  line-height: 1.15;
  text-align: center;
  color: #e61587;
  width: 50%;
  float: left;
  hr {
    width: 70%;
    margin: 0 auto;
    border: 0;
  }
`;

const StarAction = styled.div`
  width: 25%;
  float: left;
  margin: 80px 0 0 0;
  font-size: 52px;
  font-weight: 500;
  font-family: "Raleway", sans-serif;
  line-height: 1.15;
  text-align: cetner;
  color: #e61587;
  animation: rotate_image 1.5s linear infinite;
  transform-origin: 50% 20%;
  @keyframes rotate_image {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const CoverPicWrap = styled.div`
  width: 90%;
  margin: 0 auto;
  margin-bottom: 40px;
  border-radius: 50%;
  overflow: hidden;
  line-height: 0;
`;

const DevelopImg = styled.div`
  width: 100%;
  margin: 0 auto;
  margin-bottom: 40px;
  overflow: hidden;
  line-height: 0;
`;

const LiveButton = styled.button`
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  margin: 12px 10px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  background: rgba(251, 185, 107);
  animation: color-change 1s infinite;
  @keyframes color-change {
    0% {
      background: rgba(251, 185, 107, 0.7);
    }
    50% {
      background: rgb(251, 185, 107);
    }
    100% {
      background: rgba(251, 185, 107, 0.7);
    }
  }
`;

const GreetingP = styled.p`
  margin: 30px 0;
`;

const CallWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 40px 0;
  > * {
    margin: 0 15px;
  }
`;

const CallButtonWrap = styled.div<{ bgColor: string }>`
  ${TextSansStyle}
  font-size: 13px;
  svg {
    display: block;
    margin: 0 auto;
    margin-bottom: 4px;
    width: 60px;
    height: 60px;
    color: white;
    padding: 20px;
    border-radius: 30px;
    background-color: ${({ bgColor }) => bgColor};
  }
`;

type CallButtonProps = {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
};

const CallButton = ({ icon, bgColor, label }: CallButtonProps) => (
  <>
    <CallButtonWrap bgColor={bgColor}>
      {icon}
      {label}
    </CallButtonWrap>
  </>
);

const PhotoGrid = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px;
  li {
    height: 200px;
    flex-grow: 1;
    margin: 4px;
  }
  img {
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
  }
`;

const SliderWrap = styled.div<{ isZoomed: boolean }>`
  height: 100%;
  ${({ isZoomed }) =>
    isZoomed &&
    css`
      * {
        overflow: visible !important;
      }
    `}
  .slick-track {
    display: flex;
  }
  .slick-track .slick-slide {
    display: flex;
    ${({ isZoomed }) =>
      isZoomed &&
      css`
        &:not(.slick-active) {
          visibility: hidden;
        }
      `}
    height: auto;
    align-items: center;
    justify-content: center;
    div {
      outline: none;
    }
    img {
      width: 100%;
    }
  }
`;

type PinchPhotoProps = { src: string; onZoom: (isZoomed: boolean) => void };
const PinchPhoto = ({ src, onZoom }: PinchPhotoProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const pz = useRef<QuickPinchZoom>(null);
  const handleUpdate = useCallback(
    ({ x, y, scale }: UpdateAction) => {
      if (!imgRef.current) return;
      const value = make3dTransformValue({ x, y, scale });
      imgRef.current.style.setProperty("transform", value);
      onZoom(scale > 1);
    },
    [onZoom]
  );

  return (
    <QuickPinchZoom ref={pz} onUpdate={handleUpdate} draggableUnZoomed={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={src} alt="" />
    </QuickPinchZoom>
  );
};

type PhotoGalleryProps = { initialSlide?: number; onClose: () => void };
const PhotoGallery = ({ initialSlide, onClose }: PhotoGalleryProps) => {
  const [isZoomed, setZoomed] = useState(false);
  return (
    <SliderWrap isZoomed={isZoomed} onClick={onClose}>
      <Slider
        initialSlide={initialSlide || 0}
        slidesToShow={1}
        slidesToScroll={1}
        arrows={false}
        dots={false}
      >
        {Array.from(Array(12), (_, i) => i + 1).map((i) => (
          <div key={i}>
            <PinchPhoto onZoom={setZoomed} src={`/photos/p${i}.jpeg`} />
          </div>
        ))}
      </Slider>
    </SliderWrap>
  );
};

const KakaoMapButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #666;
  font-size: 13px;
  text-decoration: none;
  background: #fbe300;
  line-height: 1.3;
  > svg {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: -4px 0;
    margin-right: 4px;
  }
`;

const NaverMapButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #fff;
  font-size: 13px;
  text-decoration: none;
  background: #2db400;
  line-height: 1.3;
  > svg {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: -4px 0;
    margin-right: 4px;
  }
`;

const GiveWrap = styled.div`
  display: inline-block;
  text-align: left;
  line-height: 2;
  p {
    strong {
      font-weight: bold;
      font-size: 15px;
    }
  }
`;

const CopyTextButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  svg {
    width: 20px;
    height: 20px;
    padding: 2px;
    color: #999;
    vertical-align: sub;
  }
`;
const CopyText = ({ text }: { text: string }) => {
  const handleCopyText = () => {
    const fallbackCopyClipboard = (value: string) => {
      const $text = document.createElement("textarea");
      document.body.appendChild($text);
      $text.value = value;
      $text.select();
      document.execCommand("copy");
      document.body.removeChild($text);
    };

    navigator.clipboard
      .writeText(text)
      .catch(() => fallbackCopyClipboard(text))
      .then(() => alert("계좌번호가 복사 되었습니다."));
  };
  return (
    <>
      {text}
      <CopyTextButton onClick={handleCopyText} aria-label="복사">
        <Copy />
      </CopyTextButton>
    </>
  );
};

const WriteSectionSubHeader = styled.div`
  padding: 0 20px;
  margin-top: -68px;
  color: #666;
  p:first-child {
    float: left;
  }
  p:last-child {
    float: right;
  }
`;

const WriteButton = styled.button<{ visible: boolean }>`
  ${TextSansStyle}
  ${({ visible }) =>
    visible
      ? css`
          bottom: 45px;
        `
      : css`
          bottom: -100px;
        `}
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: calc(400px - 40px);
  padding: 16px;
  border: 0;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  background: rgba(251, 185, 107);
  ${BoxShadowStyle}
  transition: bottom 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
`;

const TalkWrap = styled.div`
  position: relative;
  padding: 0 20px;
  margin: 20px 0;
`;

const WriteButtonTrigger = styled.div`
  position: absolute;
  top: 100px;
  height: 100%;
`;

const TalkBubbleWrap = styled.div<{
  party: Party;
  color: string;
  selected: boolean;
}>`
  ${TextSansStyle}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  svg {
    ${({ party, color }) => BubbleHeadStyle(party, color)}
  }
  > div {
    ${({ party }) =>
      party === "BRIDE"
        ? css`
            margin-right: 44px;
            text-align: right;
          `
        : css`
            margin-left: 44px;
            text-align: left;
          `}
    line-height: 1.3;
    div.bubble-info-wrap {
      display: flex;
      ${({ party }) =>
        party === "BRIDE"
          ? css`
              flex-direction: row-reverse;
            `
          : css`
              flex-direction: row;
            `}
      p {
        white-space: pre-wrap;
        text-align: left;
        word-break: break-all;
        overflow-wrap: break-word;
        display: inline-block;
        padding: 8px 12px;
        margin: 4px 0 0 0;
        ${({ party }) =>
          party === "BRIDE"
            ? css`
                border-radius: 20px 4px 20px 20px;
                margin-left: 3px;
              `
            : css`
                border-radius: 4px 20px 20px 20px;
                margin-right: 3px;
              `}
        background: #eee;
        ${({ selected }) =>
          selected &&
          css`
            background: #ddd;
          `}
      }
      small {
        align-self: flex-end;
        flex-shrink: 0;
        color: #999;
        font-size: 11px;
      }
    }
    .edit {
      font-size: 0.9em;
      color: #999;
      text-decoration: underline;
    }
  }
`;

type TalkBubbleProps = {
  talk: Talk;
  selected: boolean;
  onBubbleClick: (id: string | undefined) => void;
  onEditClick: (id: string) => void;
};
const TalkBubble = ({
  talk,
  selected,
  onBubbleClick,
  onEditClick,
}: TalkBubbleProps) => {
  const handleBubbleClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onBubbleClick(talk.id);
  };
  const handleBubbleOutsideClick: MouseEventHandler = (e) =>
    onBubbleClick(undefined);
  const handleEditClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onEditClick(talk.id);
  };
  const editBtn = (
    <span className="edit" onClick={handleEditClick}>
      수정하기
    </span>
  );
  return (
    <TalkBubbleWrap party={talk.party} color={talk.color} selected={selected}>
      {talk.party === "BRIDE" ? <Heart /> : <Heart />}
      <div onClick={handleBubbleOutsideClick}>
        {selected && talk.party === "BRIDE" && <>{editBtn} </>}
        {talk.author}
        {selected && talk.party === "GROOM" && <> {editBtn}</>}
        <div className="bubble-info-wrap">
          <p onClick={handleBubbleClick}>{talk.msg}</p>
          <small>
            {!talk.published
              ? "검수중"
              : timeDiffFormat(new Date(talk.created))}
          </small>
        </div>
      </div>
    </TalkBubbleWrap>
  );
};

const Home = () => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const { data: talkListResp, mutate } = useSWR<GetTalkListResponse>(
    "/api/talk/list",
    fetcher
  );

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showWriteTalkModal, setShowWriteTalkModal] = useState(false);
  const [showEditTalkModal, setShowEditTalkModal] = useState<Talk>();
  const [isWriteButtonShown, setWriteButtonShown] = useState(false);
  const [lastClickedGalleryItem, setLastClickedGalleryItem] =
    useState<number>();
  const [selectedTalkId, setSelectedTalkId] = useState<string>();

  const writeButtonTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!writeButtonTriggerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setWriteButtonShown(entry.isIntersecting);
    });
    observer.observe(writeButtonTriggerRef.current);

    return () => observer.disconnect();
  }, [writeButtonTriggerRef]);

  const handlePhotoClick = (i: number) => {
    setLastClickedGalleryItem(i);
    setShowGalleryModal(true);
  };

  const handleGalleryModalClose = () => setShowGalleryModal(false);

  const handleTalkBubbleClick = (id: string | undefined) =>
    setSelectedTalkId(id);

  const scrollElement = useRef<HTMLDivElement>(null);

  const onMoveElement = () => {
    scrollElement.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleWriteButtonClick = () => setShowWriteTalkModal(true);
  onMoveElement();
  const handleWriteTalk = (_: string) => {
    setShowWriteTalkModal(false);
    mutate();
  };
  const handleWriteTalkModalClose = () => setShowWriteTalkModal(false);

  const handleTalkEditClick = (id: string) => {
    const talk = talkListResp?.talks?.find((t) => t.id === id);
    if (!talk) return;
    setShowEditTalkModal(talk);
    setSelectedTalkId(undefined);
  };
  const handleEditTalk = (_: string) => {
    setShowEditTalkModal(undefined);
    mutate();
  };
  const handleEditTalkModalClose = () => setShowEditTalkModal(undefined);

  // @ts-ignore
  // @ts-ignore
  return (
    <Main>
      <StarAction className="star">*</StarAction>
      <TopTitle>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        WE'RE
        <hr />
        GETTING
        <hr />
        MARRIED
      </TopTitle>
      <StarAction className="star">*</StarAction>
      <CoverPicWrap>
        <Image src={coverPic} priority={true} placeholder="blur" alt="" />
      </CoverPicWrap>
      <DevelopImg>
        <Image src={developPic} priority={true} placeholder="blur" alt="" />
      </DevelopImg>
      <SectionHr />
      <Header>
        <p>
          2022년 9월 24일 토요일 오후 12시30분
          <br />
          🌳 에덴 파라다이스 호텔 에덴 가든 🍃
        </p>
      </Header>

      <SectionHr />
      <Header>
        <Image
          src={hoya}
          priority={true}
          placeholder="blur"
          alt=""
          width={100}
          height={100}
        />
        <div className="name">창호 & 예린</div>
        <Image
          src={yerin}
          priority={true}
          placeholder="blur"
          alt=""
          width={100}
          height={100}
        />
        <SectionHeader>9월의 좋은 날, 결혼합니다.</SectionHeader>
      </Header>
      <GreetingP>
        인생에서 가장 아름답고 행복한 순간,
        <br />
        우리의 작은 결혼식에 초대합니다.
      </GreetingP>
      <GreetingP>
        故이점욱 · 신명희의 아들 이창호
        <br />
        고정현 · 염수경의 딸 고예린
      </GreetingP>
      <CallWrap>
        <a href="tel:01092772904">
          <CallButton
            icon={<Heart />}
            bgColor="#fbb96b"
            label="신랑측에 연락하기"
          />
        </a>
        <a href="tel:01072646292">
          <CallButton
            icon={<Heart />}
            bgColor="#fbb96b"
            label="신부측에 연락하기"
          />
        </a>
      </CallWrap>
      <SectionHr />
      <PhotoGrid>
        {Array.from(Array(12), (_, i) => i).map((i) => (
          <li key={i}>
            <img
              role="button"
              src={`/photos/p${i + 1}.jpeg`}
              onClick={() => handlePhotoClick(i)}
              loading="lazy"
              alt=""
            />
          </li>
        ))}
      </PhotoGrid>
      {showGalleryModal && (
        <Modal handleClose={handleGalleryModalClose}>
          <PhotoGallery
            initialSlide={lastClickedGalleryItem}
            onClose={handleGalleryModalClose}
          />
        </Modal>
      )}
      <SectionHr />
      <SectionHeader>
        <Image src={mapTitle} width="80px" height="40px" alt="" />
      </SectionHeader>
      <Image src={mapPic} width="400px" height="300px" alt="" />
      <p>
        경기도 이천시 마장면 서이천로 449-79
        <br />
        에덴 파라다이스 호텔 에덴 가든
      </p>
      <KakaoMapButton href="https://place.map.kakao.com/1019006789">
        <PinAlt color="#1199EE" /> 카카오맵
      </KakaoMapButton>
      <NaverMapButton href="https://map.naver.com/v5/entry/place/151818813">
        <PinAlt color="#fff" /> 네이버지도
      </NaverMapButton>
      <SectionHr />
      <SectionHeader>전세 버스 안내 🚌</SectionHeader>
      <GiveWrap>
        <p>
          <strong>예식 당일 오전 10시</strong>
          <br />
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p>서울 강동구 '천호역 5번 출구' 앞</p>
        </p>
      </GiveWrap>
      <SectionHr />
      <p>
        🌻 화환 대신 마음만 감사히 받겠습니다. 💐
        <br />
        결혼식장의 아름다운 꽃은
        <br />
        축하해주시는 여러분 모두 입니다.
      </p>
      <SectionHr />
      <GiveWrap ref={scrollElement}>
        <YouTube
          videoId={"z2L30TDwDPI"}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 0,
              rel: 0,
              modestbranding: 1,
            },
          }}
          onEnd={(e) => {
            e.target.stopVideo(0);
          }}
        />
      </GiveWrap>
      <SectionHr />
      <SectionHeader>축하의 한마디</SectionHeader>
      <WriteSectionSubHeader>
        <p>🤵🏻신랑측</p>
        <p>신부측👰🏻‍♀️</p>
      </WriteSectionSubHeader>
      <div style={{ clear: "both" }} />
      <TalkWrap>
        <WriteButtonTrigger ref={writeButtonTriggerRef} />
        {talkListResp?.talks.map((talk) => (
          <TalkBubble
            key={talk.id}
            talk={talk}
            selected={talk.id === selectedTalkId}
            onBubbleClick={handleTalkBubbleClick}
            onEditClick={handleTalkEditClick}
          />
        ))}
      </TalkWrap>
      <WriteButton
        visible={isWriteButtonShown}
        onClick={handleWriteButtonClick}
      >
        나도 한마디 💐
      </WriteButton>
      {showWriteTalkModal && (
        <Modal handleClose={handleWriteTalkModalClose}>
          <WriteTalk onWrite={handleWriteTalk} />
        </Modal>
      )}
      {showEditTalkModal && (
        <Modal handleClose={handleEditTalkModalClose}>
          <EditTalk talk={showEditTalkModal} onEdit={handleEditTalk} />
        </Modal>
      )}
    </Main>
  );
};

export default Home;
