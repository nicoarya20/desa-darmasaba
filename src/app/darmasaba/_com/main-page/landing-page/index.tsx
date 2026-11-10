"use client";
import profileLandingPageState from "@/app/admin/(dashboard)/_state/landing-page/profile";
import { Image } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { useProxy } from "valtio/utils";
import { HeroSosmed, HeroStatus } from "./HeroInfo";
import { HeroProfile, HeroProfileSkeleton } from "./HeroProfile";
import { HeroPrograms, type ProgramInovasiItem } from "./HeroPrograms";
import s from "./landing.module.css";
import { LANDING_TEXT } from "./landing.text";
import { useLandingData } from "./use-landing-data";

const TITLE_ID = "landing-hero-title";

/** Hero beranda: identitas pemerintah desa, sambutan, status kantor, Perbekel, dan rel program inovasi. */
function LandingPage() {
  const { socialMedia, profile, loadingSosmed, loadingProfile, workStatus } = useLandingData();
  const programs = useProxy(profileLandingPageState.programInovasi);

  useShallowEffect(() => {
    programs.findMany.load();
  }, []);

  return (
    <section className={s.section} aria-labelledby={TITLE_ID}>
      <div className={s.top}>
        <div className={s.copy}>
          <div className={s.identity}>
            <span className={s.logo}>
              <Image src="/darmasaba-icon.png" alt={LANDING_TEXT.logoDesa} fit="contain" />
            </span>
            <span className={s.logo}>
              <Image src="/pudak-icon.png" alt={LANDING_TEXT.logoPudak} fit="contain" />
            </span>
            <p className={s.identityText}>
              <span className={s.org}>{LANDING_TEXT.org}</span>
              <span className={s.region}>{LANDING_TEXT.region}</span>
            </p>
          </div>

          <h1 id={TITLE_ID} className={s.title}>
            <span className={s.greeting}>{LANDING_TEXT.greeting}</span>
            {LANDING_TEXT.title}
          </h1>

          <HeroStatus status={workStatus} />
          {!loadingSosmed && <HeroSosmed data={socialMedia} />}
        </div>

        {loadingProfile ? <HeroProfileSkeleton /> : profile && <HeroProfile data={profile} />}
      </div>

      <HeroPrograms
        items={(programs.findMany.data ?? []) as ProgramInovasiItem[]}
        loading={programs.findMany.loading}
      />
    </section>
  );
}

export default LandingPage;
