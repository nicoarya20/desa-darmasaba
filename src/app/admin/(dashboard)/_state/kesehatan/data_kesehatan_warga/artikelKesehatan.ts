import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/* Introduction */
const templateIntroduction = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
})

type Introduction = Prisma.IntroductionGetPayload<{
  select: {
    content: true;
  };
}>;

const introduction = proxy({
  create: {
    form: {} as Introduction,
    loading: false,
    async create() {
      const cek = templateIntroduction.safeParse(introduction.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        introduction.create.loading = true;
        const res = await ApiFetch.api.kesehatan.introduction["create"].post(introduction.create.form);
        if (res.status === 200) {
          introduction.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        introduction.create.loading = false;
      }
    },
  },
  findMany: {
      data: null as
      | Prisma.IntroductionGetPayload<{ omit: { isActive: true } }>[]
      | null,
      async load() {
        const res = await ApiFetch.api.kesehatan.introduction["find-many"].get();
        if (res.status === 200) {
          introduction.findMany.data = res.data?.data ?? [];
        }
      }
  }
});
/* ======================================================================= */

/* symptom */
const templateSymptom = z.object({
  title: z.string().min(3, "Title minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
})

type Symptom = Prisma.SymptomGetPayload<{
  select: {
    title: true;
    content: true;
  };
}>;

const symptom = proxy({
  create: {
    form: {} as Symptom,
    loading: false,
    async create() {
      const cek = templateSymptom.safeParse(symptom.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        symptom.create.loading = true;
        const res = await ApiFetch.api.kesehatan.symptom["create"].post(symptom.create.form);
        if (res.status === 200) {
          symptom.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        symptom.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.SymptomGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.symptom["find-many"].get();
      if (res.status === 200) {
        symptom.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* Prevention */
const templatePrevention = z.object({
  title: z.string().min(3, "Title minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
})

type Prevention = Prisma.PreventionGetPayload<{
  select: {
    title: true;
    content: true;
  };
}>;

const prevention = proxy({
  create: {
    form: {} as Prevention,
    loading: false,
    async create() {
      const cek = templatePrevention.safeParse(prevention.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        prevention.create.loading = true;
        const res = await ApiFetch.api.kesehatan.prevention["create"].post(prevention.create.form);
        if (res.status === 200) {
          prevention.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        prevention.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PreventionGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.prevention["find-many"].get();
      if (res.status === 200) {
        prevention.findMany.data = res.data?.data ?? [];
      }
    },
  },
});
/* ======================================================================= */

/* First Aid */
const templateFirstAid = z.object({
  title: z.string().min(3, "Title minimal 3 karakter"),
  content: z.string().min(3, "Content minimal 3 karakter"),
})

type FirstAid = Prisma.FirstAidGetPayload<{
  select: {
    title: true;
    content: true;
  };
}>;

const firstAid = proxy({
    create: {
        form: {} as FirstAid,
        loading: false,
        async create() {
            const cek = templateFirstAid.safeParse(firstAid.create.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                firstAid.create.loading = true;
                const res = await ApiFetch.api.kesehatan.firstaid["create"].post(firstAid.create.form);
                if (res.status === 200) {
                    firstAid.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                firstAid.create.loading = false;
            }
        },
    },
    findMany: {
        data: null as
            | Prisma.FirstAidGetPayload<{ omit: { isActive: true } }>[]
            | null,
        async load() {
            const res = await ApiFetch.api.kesehatan.firstaid["find-many"].get();
            if (res.status === 200) {
                firstAid.findMany.data = res.data?.data ?? [];
            }
        },
    },
})
/* ======================================================================= */

/* Myth vs Fact */
const templateMythFact = z.object({
  title: z.string().min(3, "Title minimal 3 karakter"),
  mitos: z.string().min(3, "Mitos minimal 3 karakter"),
  fakta: z.string().min(3, "Fakta minimal 3 karakter"),
})

type MythFact = Prisma.MythVsFactGetPayload<{
  select: {
    title: true;
    mitos: true;
    fakta: true;
  };
}>;

const mythFact = proxy({
  create: {
    form: {} as MythFact,
    loading: false,
    async create() {
      const cek = templateMythFact.safeParse(mythFact.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        mythFact.create.loading = true;
        const res = await ApiFetch.api.kesehatan.mythvsfact["create"].post(mythFact.create.form);
        if (res.status === 200) {
          mythFact.findMany.load();
          return toast.success("success create");
        }
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        mythFact.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.MythVsFactGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.mythvsfact["find-many"].get();
      if (res.status === 200) {
        mythFact.findMany.data = res.data?.data ?? [];
      }
    },
  },
})
/* ======================================================================= */

/* Doctor Sign */
const templateDoctorSign = z.object({
  content: z.string().min(3, "Content minimal 3 karakter"),
})

type DoctorSign = Prisma.DoctorSignGetPayload<{
    select: {
        content: true
    }
}>

const doctorSign = proxy({
    create: {
        form: {} as DoctorSign,
        loading: false,
        async create() {
            const cek = templateDoctorSign.safeParse(doctorSign.create.form);
            if (!cek.success) {
                const err = `[${cek.error.issues
                    .map((v) => `${v.path.join(".")}`)
                    .join("\n")}] required`;
                return toast.error(err);
            }
            try {
                doctorSign.create.loading = true;
                const res = await ApiFetch.api.kesehatan.doctor_sign["create"].post(doctorSign.create.form);
                if (res.status === 200) {
                    doctorSign.findMany.load();
                    return toast.success("success create");
                }
                return toast.error("failed create");
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                doctorSign.create.loading = false;
            }
        },
    },
    findMany: {
        data: null as
            | Prisma.DoctorSignGetPayload<{ omit: { isActive: true } }>[]
            | null,
        async load() {
            const res = await ApiFetch.api.kesehatan.doctor_sign["find-many"].get();
            if (res.status === 200) {
                doctorSign.findMany.data = res.data?.data ?? [];
            }
        },
    },
})

/* ======================================================================= */

const stateArtikelKesehatan = proxy({
  introduction,
  symptom,
  prevention,
  firstAid,
  mythFact,
  doctorSign
})

export default stateArtikelKesehatan