import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

/**
 * Schema validasi form ProfilePPID menggunakan Zod.
 */
const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  biodata: z.string().min(3, "Biodata minimal 3 karakter"),
  riwayat: z.string().min(3, "Riwayat minimal 3 karakter"),
  pengalaman: z.string().min(3, "Pengalaman minimal 3 karakter"),
  unggulan: z.string().min(3, "Unggulan minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const defaultForm = {
  name: "",
  biodata: "",
  riwayat: "",
  pengalaman: "",
  unggulan: "",
  imageId: "",
};

type ProfilePPIDForm = Prisma.ProfilePPIDGetPayload<{
  select: {
    id: true;
    name: true;
    biodata: true;
    riwayat: true;
    pengalaman: true;
    unggulan: true;
    imageId: true;
    image?: {
      select: {
        link: true;
      };
    };
  };
}>;

/**
 * Improved State Management - Consolidated and more robust
 */
const stateProfilePPID = proxy({
  // Consolidated data management
  profile: {
    data: null as ProfilePPIDForm | null,
    loading: false,
    error: null as string | null,

    // Single method to load profile data
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`/api/ppid/profileppid/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(result.message || "Gagal mengambil data profile");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Load profile error:", errorMessage);
        toast.error("Terjadi kesalahan saat mengambil data profile");
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Reset profile data
    reset() {
      this.data = null;
      this.error = null;
      this.loading = false;
    }
  },

  // Edit form management
  editForm: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false, // Flag untuk data yang tidak bisa diedit

    // Initialize form with profile data
    initialize(profileData: ProfilePPIDForm) {
      this.id = profileData.id;
      this.isReadOnly = false; // Semua data bisa diedit
      this.form = {
        name: profileData.name || "",
        biodata: profileData.biodata || "",
        riwayat: profileData.riwayat || "",
        pengalaman: profileData.pengalaman || "",
        unggulan: profileData.unggulan || "",
        imageId: profileData.imageId || "",
      };
    },

    // Update form field
    updateField(field: keyof typeof defaultForm, value: string) {
      this.form[field] = value;
    },

    // Submit form
    async submit() {
      // Validate form
      const validation = templateForm.safeParse(this.form);
      
      if (!validation.success) {
        const errors = validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`/api/ppid/profileppid/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update profile");
          // Refresh profile data
          await stateProfilePPID.profile.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update profile");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Update profile error:", errorMessage);
        toast.error("Terjadi kesalahan saat update profile");
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Reset form
    reset() {
      this.id = "";
      this.form = { ...defaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    }
  },

  // Helper methods
  async loadForEdit(id: string) {
    const profileData = await this.profile.load(id);
    if (profileData) {
      this.editForm.initialize(profileData);
    }
    return profileData;
  },

  reset() {
    this.profile.reset();
    this.editForm.reset();
  }
});

export default stateProfilePPID;