import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateSurveyForm = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  totalRespondents: z.number().min(0),
  averageScore: z.number().min(0),
});

const defaultSurveyForm = {
  title: "",
  totalRespondents: 0,
  averageScore: 0,
};

const surveyState = proxy({
  create: {
    form: { ...defaultSurveyForm },
    loading: false,
    async create() {
      const cek = templateSurveyForm.safeParse(surveyState.create.form);
      if (!cek.success) return toast.error(cek.error.errors[0].message);

      try {
        surveyState.create.loading = true;
        const res =
          await ApiFetch.api.landingpage.indekskepuasanmasyarakat.survey.create.post(
            { ...surveyState.create.form }
          );

        if (res.status === 200) {
          toast.success("Data survey berhasil ditambahkan");
          surveyState.findMany.load();
        } else {
          toast.error("Gagal menambahkan data survey");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat membuat survey");
        console.error(error);
      } finally {
        surveyState.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.SurveyGetPayload<{
          include: { monthlyStats: true };
        }>[]
      | null,
    loading: false,
    async load() {
      try {
        surveyState.findMany.loading = true;
        const res =
          await ApiFetch.api.landingpage.indekskepuasanmasyarakat.survey.findMany.get();
        if (res.status === 200) {
          surveyState.findMany.data = res.data?.data ?? [];
        }
      } catch (error) {
        toast.error("Gagal mengambil data survey");
        console.error(error);
      } finally {
        surveyState.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as Prisma.SurveyGetPayload<{
      include: { monthlyStats: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/survey/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          surveyState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          surveyState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        surveyState.findUnique.data = null;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultSurveyForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        surveyState.edit.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/survey/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            title: data.title,
            totalRespondents: data.totalRespondents,
            averageScore: data.averageScore,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading survey:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        surveyState.edit.loading = false;
      }
    },

    async update() {
      const cek = templateSurveyForm.safeParse(surveyState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        surveyState.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/survey/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: this.form.title,
              totalRespondents: this.form.totalRespondents,
              averageScore: this.form.averageScore,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update survey");
          await surveyState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate survey");
        }
      } catch (error) {
        console.error("Error updating survey:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate survey"
        );
        return false;
      } finally {
        surveyState.edit.loading = false;
      }
    },
    reset() {
      surveyState.edit.id = "";
      surveyState.edit.form = { ...defaultSurveyForm };
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        surveyState.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/survey/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "survey berhasil dihapus");
          await surveyState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus survey");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus survey");
      } finally {
        surveyState.delete.loading = false;
      }
    },
  },
});

//========================================= MONTHLY STAT ========================================= //

const templateMonthlyForm = z.object({
  month: z.string().min(1, "Bulan wajib diisi"),
  respondentsCount: z.number().min(0, "Jumlah responden minimal 0"),
  surveyId: z.string().min(1, "Survey ID wajib diisi"),
});

const defaultMonthlyForm = {
  month: "",
  respondentsCount: 0,
  surveyId: "",
};

const monthlyStatState = proxy({
  create: {
    form: { ...defaultMonthlyForm },
    loading: false,
    async create() {
      const cek = templateMonthlyForm.safeParse(monthlyStatState.create.form);
      if (!cek.success) {
        toast.error(cek.error.errors[0].message);
        return;
      }

      try {
        monthlyStatState.create.loading = true;
        const res =
          await ApiFetch.api.landingpage.indekskepuasanmasyarakat.monthlystat.create.post(
            {
              ...monthlyStatState.create.form,
            }
          );

        if (res.status === 200) {
          toast.success("Data statistik bulanan berhasil ditambahkan");
          monthlyStatState.findMany.load();
        } else {
          toast.error("Gagal menambahkan data statistik bulanan");
        }
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan saat membuat data bulanan");
      } finally {
        monthlyStatState.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as
      | Prisma.MonthlyStatGetPayload<{ include: { survey: true } }>[]
      | null,
    loading: false,
    async load() {
      try {
        monthlyStatState.findMany.loading = true;
        const res =
          await ApiFetch.api.landingpage.indekskepuasanmasyarakat.monthlystat.findMany.get();
        if (res.status === 200) {
          monthlyStatState.findMany.data = res.data?.data ?? [];
        }
      } catch (error) {
        console.error(error);
        toast.error("Gagal mengambil data statistik bulanan");
      } finally {
        monthlyStatState.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as Prisma.MonthlyStatGetPayload<{
      include: { survey: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/monthlystat/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          monthlyStatState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch monthlyStat", res.status);
        }
      } catch (error) {
        console.error("Error fetching monthlyStat:", error);
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultMonthlyForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        monthlyStatState.edit.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/monthlystat/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            month: data.month,
            respondentsCount: data.respondentsCount,
            surveyId: data.surveyId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading survey:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        monthlyStatState.edit.loading = false;
      }
    },

    async update() {
      const cek = templateMonthlyForm.safeParse(monthlyStatState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        monthlyStatState.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/monthlystat/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              month: this.form.month,
              respondentsCount: this.form.respondentsCount,
              surveyId: this.form.surveyId,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update survey");
          await monthlyStatState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate survey");
        }
      } catch (error) {
        console.error("Error updating survey:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate survey"
        );
        return false;
      } finally {
        monthlyStatState.edit.loading = false;
      }
    },
    reset() {
      monthlyStatState.edit.id = "";
      monthlyStatState.edit.form = { ...defaultMonthlyForm };
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        monthlyStatState.delete.loading = true;
        const res = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/monthlystat/del/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await res.json();
        if (res.ok && result?.success) {
          toast.success("Data berhasil dihapus");
          monthlyStatState.findMany.load();
        } else {
          toast.error(result.message || "Gagal menghapus data");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Terjadi kesalahan saat delete");
      } finally {
        monthlyStatState.delete.loading = false;
      }
    },
  },
});

//========================================= AGE STAT ========================================= //

const templateAgeStatForm = z.object({
  group: z.string().min(1, "Group wajib diisi"),
  count: z.number().min(0, "Jumlah wajib diisi"),
  monthlyStatId: z.string().min(1, "Monthly Stat ID wajib diisi"),
});

const defaultAgeStatForm = {
  group: "",
  count: 0,
  monthlyStatId: "",
};

const ageStatState = proxy({
  create: {
    form: { ...defaultAgeStatForm },
    loading: false,
    async create() {
      const cek = templateAgeStatForm.safeParse(ageStatState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        ageStatState.create.loading = true;
        const res = await ApiFetch.api.landingpage.indekskepuasanmasyarakat.age[
          "create"
        ].post({
          ...ageStatState.create.form,
        });

        if (res.status === 200) {
          ageStatState.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        ageStatState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.AgeStatGetPayload<{
        include: {
          MonthlyStat: true;
        };
      }>
    > | null,
    async load() {
      const res = await ApiFetch.api.landingpage.indekskepuasanmasyarakat.age[
        "findMany"
      ].get();
      if (res.status === 200) {
        ageStatState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.AgeStatGetPayload<{
      include: {
        MonthlyStat: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/age/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          ageStatState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          ageStatState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        ageStatState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        ageStatState.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/age/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "age berhasil dihapus");
          await ageStatState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus age");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus age");
      } finally {
        ageStatState.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultAgeStatForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        ageStatState.edit.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/age/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            group: data.group,
            count: data.count,
            monthlyStatId: data.monthlyStatId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading ages :", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        ageStatState.edit.loading = false;
      }
    },

    async update() {
      const cek = templateAgeStatForm.safeParse(ageStatState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        ageStatState.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/age/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              group: this.form.group,
              count: this.form.count,
              monthlyStatId: this.form.monthlyStatId,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update age");
          await ageStatState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate age");
        }
      } catch (error) {
        console.error("Error updating age:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate age"
        );
        return false;
      } finally {
        ageStatState.edit.loading = false;
      }
    },
    reset() {
      ageStatState.edit.id = "";
      ageStatState.edit.form = { ...defaultAgeStatForm };
    },
  },
});

//========================================= GENDER STAT ========================================= //

const templateGenderStatForm = z.object({
  laki: z.number().min(0, "Jumlah wajib diisi"),
  perempuan: z.number().min(0, "Jumlah wajib diisi"),
  monthlyStatId: z.string().min(1, "Monthly Stat ID wajib diisi"),
  total: z.number().min(0, "Jumlah wajib diisi"),
  percentLaki: z.number().min(0, "Jumlah wajib diisi"),
  percentPerempuan: z.number().min(0, "Jumlah wajib diisi"),
});

const defaultGenderStatForm = {
  laki: 0,
  perempuan: 0,
  total: 0,
  percentLaki: 0,
  percentPerempuan: 0,
  monthlyStatId: "",
};

const genderStatState = proxy({
  create: {
    form: { ...defaultGenderStatForm },
    loading: false,
    async create() {
      const cek = templateGenderStatForm.safeParse(genderStatState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      const { laki, perempuan } = genderStatState.create.form;
      const total = laki + perempuan;
      const percentLaki = total > 0 ? Number(((laki / total) * 100).toFixed(2)) : 0;
      const percentPerempuan = total > 0 ? Number(((perempuan / total) * 100).toFixed(2)) : 0;

      try {
        genderStatState.create.loading = true;
        const res = await fetch('/api/landingpage/indekskepuasanmasyarakat/gender/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...genderStatState.create.form,
            total,
            percentLaki,
            percentPerempuan,
          }),
        });
  
        const result = await res.json();
        if (result.success) {
          toast.success("Data berhasil ditambahkan");
          genderStatState.findMany.load(); // refresh list
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        toast.error("Gagal tambah data");
        console.error(err);
      } finally {
        genderStatState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.genderStatGetPayload<{
        include: {
          MonthlyStat: true;
        };
      }>
    > | null,
    async load() {
      const res =
        await ApiFetch.api.landingpage.indekskepuasanmasyarakat.gender[
          "findMany"
        ].get();
      if (res.status === 200) {
        genderStatState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.genderStatGetPayload<{
      include: {
        MonthlyStat: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/gender/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          genderStatState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          genderStatState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        genderStatState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        genderStatState.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/gender/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "gender berhasil dihapus");
          await genderStatState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus gender");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus gender");
      } finally {
        genderStatState.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultGenderStatForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        genderStatState.edit.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/gender/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            laki: data.laki,
            perempuan: data.perempuan,
            monthlyStatId: data.monthlyStatId,
            total: data.total,
            percentLaki: Number(data.percentLaki),
            percentPerempuan: Number(data.percentPerempuan),
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading ages :", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        genderStatState.edit.loading = false;
      }
    },

    async update() {
      const { laki, perempuan } = genderStatState.edit.form;
      const total = laki + perempuan;
      const percentLaki = total > 0 ? Number(((laki / total) * 100).toFixed(2)) : 0;
      const percentPerempuan = total > 0 ? Number(((perempuan / total) * 100).toFixed(2)) : 0;
  
      try {
        genderStatState.edit.loading = true;
        const res = await fetch(`/api/landingpage/indekskepuasanmasyarakat/gender/${genderStatState.edit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...genderStatState.edit.form,
            total,
            percentLaki: Number(percentLaki),
            percentPerempuan: Number(percentPerempuan),
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${res.status}`
          );
        }
        const result = await res.json();
        if (result.success) {
          toast.success("Berhasil update gender");
          await genderStatState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate gender");
        }
      } catch (error) {
        console.error("Error updating gender:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate gender"
        );
        return false;
      } finally {
        genderStatState.edit.loading = false;
      }
    },
    reset() {
      genderStatState.edit.id = "";
      genderStatState.edit.form = { ...defaultGenderStatForm };
    },
  },
});

//========================================= RESPONSE STAT ========================================= //

const templateResponseStatForm = z.object({
  label: z.string().min(1, "Label wajib diisi"),
  count: z.number().min(0, "Jumlah wajib diisi"),
  monthlyStatId: z.string().min(1, "Monthly Stat ID wajib diisi"),
});

const defaultResponseStatForm = {
  label: "",
  count: 0,
  monthlyStatId: "",
};

const responseStatState = proxy({
  create: {
    form: { ...defaultResponseStatForm },
    loading: false,
    async create() {
      const cek = templateResponseStatForm.safeParse(
        responseStatState.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        responseStatState.create.loading = true;
        const res =
          await ApiFetch.api.landingpage.indekskepuasanmasyarakat.response[
            "create"
          ].post({
            ...responseStatState.create.form,
          });

        if (res.status === 200) {
          responseStatState.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        responseStatState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.ResponseStatGetPayload<{
        include: {
          MonthlyStat: true;
        };
      }>
    > | null,
    async load() {
      const res =
        await ApiFetch.api.landingpage.indekskepuasanmasyarakat.response[
          "findMany"
        ].get();
      if (res.status === 200) {
        responseStatState.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.ResponseStatGetPayload<{
      include: {
        MonthlyStat: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/response/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          responseStatState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          responseStatState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        responseStatState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        responseStatState.delete.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/response/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "response berhasil dihapus");
          await responseStatState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus response");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus response");
      } finally {
        responseStatState.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultResponseStatForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        responseStatState.edit.loading = true;

        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/response/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            label: data.label,
            count: data.count,
            monthlyStatId: data.monthlyStatId,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading ages :", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      } finally {
        responseStatState.edit.loading = false;
      }
    },

    async update() {
      const cek = templateResponseStatForm.safeParse(
        responseStatState.edit.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        responseStatState.edit.loading = true;
        const response = await fetch(
          `/api/landingpage/indekskepuasanmasyarakat/response/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              label: this.form.label,
              count: this.form.count,
              monthlyStatId: this.form.monthlyStatId,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update response");
          await responseStatState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate response");
        }
      } catch (error) {
        console.error("Error updating response:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengupdate response"
        );
        return false;
      } finally {
        responseStatState.edit.loading = false;
      }
    },
    reset() {
      responseStatState.edit.id = "";
      responseStatState.edit.form = { ...defaultResponseStatForm };
    },
  },
});

const indeksKepuasanState = proxy({
  surveyState,
  monthlyStatState,
  ageStatState,
  genderStatState,
  responseStatState,
});

export default indeksKepuasanState;
