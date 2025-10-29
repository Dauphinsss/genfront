"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Pencil, User, Copy, Check, LogOut, X } from "lucide-react";
import { updateProfile } from "@/services/profile";
import { cn } from "@/lib/utils";
import { useAuthenticatedImage } from "@/lib/image-utils";

interface ProfileViewProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
  onUserUpdate: (updatedUser: {
    name: string;
    email: string;
    avatar: string;
  }) => void;
}

export function ProfileView({
  user,
  onLogout,
  onUserUpdate,
}: ProfileViewProps) {
  const [currentUser, setCurrentUser] = useState(user);
  const [displayName, setDisplayName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalDisplayName, setOriginalDisplayName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [isCropping, setIsCropping] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const croppingUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("pyson_token") || ""
      : "";

  const { imageSrc: authenticatedAvatarSrc } = useAuthenticatedImage(currentUser.avatar);

  useEffect(() => {
    setCurrentUser(user);
    setDisplayName(user.name);
    setOriginalDisplayName(user.name);
  }, [user]);

  useEffect(() => {
    return () => {
      if (croppingUrlRef.current) URL.revokeObjectURL(croppingUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const onPickAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imagenes JPG, PNG, WebP o GIF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen debe ser menor a 10MB");
      return;
    }

    if (croppingUrlRef.current) {
      URL.revokeObjectURL(croppingUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    croppingUrlRef.current = objectUrl;
    originalFileRef.current = file;
    setCroppingImage(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsCropping(true);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updatedProfile = await updateProfile(token, { name: displayName });
      setCurrentUser(updatedProfile);
      setDisplayName(updatedProfile.name);
      setOriginalDisplayName(updatedProfile.name);
      localStorage.setItem("pyson_user", JSON.stringify(updatedProfile));
      onUserUpdate(updatedProfile);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      alert("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setDisplayName(originalDisplayName);
    setIsEditing(false);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (error) {
      console.error("Error al copiar email:", error);
    }
  };

  const clearPreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setAvatarPreview(null);
  };

  const resetCroppingState = () => {
    setIsCropping(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCroppingImage(null);
    if (croppingUrlRef.current) {
      URL.revokeObjectURL(croppingUrlRef.current);
      croppingUrlRef.current = null;
    }
    originalFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropCancel = () => {
    if (uploading) return;
    resetCroppingState();
  };

  const uploadAvatarFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const activeToken = localStorage.getItem("pyson_token");
      const response = await fetch("http://localhost:4000/api/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (!result.success || !result.user) {
        throw new Error(result.message || "No se pudo actualizar el avatar");
      }
      const updatedUser = {
        ...currentUser,
        avatar: result.user.avatar,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("pyson_user", JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);
      clearPreviewUrl();
      return true;
    } catch (error) {
      console.error("Error subiendo avatar:", error);
      alert("No se pudo actualizar el avatar");
      clearPreviewUrl();
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleCropConfirm = async () => {
    if (!croppingImage || !croppedAreaPixels || !originalFileRef.current)
      return;
    try {
      const blob = await getCroppedImage(croppingImage, croppedAreaPixels);
      const fileName = originalFileRef.current.name || "avatar.jpg";
      const croppedFile = new File([blob], fileName, { type: blob.type });
      const previewUrl = URL.createObjectURL(blob);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = previewUrl;
      setAvatarPreview(previewUrl);

      const success = await uploadAvatarFile(croppedFile);
      if (success) {
        resetCroppingState();
      }
    } catch (error) {
      console.error("Error al recortar avatar:", error);
      alert("No se pudo recortar la imagen");
      clearPreviewUrl();
    }
  };

  const avatarSrc = avatarPreview ?? authenticatedAvatarSrc;

  return (
    <section className="space-y-8 max-w-6xl mx-auto ">
      <Card className="relative overflow-hidden">
        <CardContent className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="relative">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border border-border/60 bg-background shadow-sm md:h-32 md:w-32">
                  <Image
                    src={avatarSrc}
                    alt={currentUser.name}
                    fill
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-cover"
                    priority
                  />
                  {!currentUser.avatar && !avatarPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-lg font-semibold text-primary md:text-xl">
                      {getInitials(currentUser.name)}
                    </div>
                  )}
                    {uploading && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 rounded-full">
                
                    </div>
                    )}
                </div>
                <div className="mt-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Cambiar avatar
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left md:flex-1">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu perfil y preferencias de cuenta.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
                >
                  Cuenta Pyson
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
                >
                  Sesion activa
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickAvatar}
          disabled={uploading}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card variant="glass">
          <CardHeader className="space-y-1">
            <CardTitle>Informacion personal</CardTitle>
            <CardDescription>
              Actualiza el nombre que se muestra en certificados y reportes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Nombre completo
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {isEditing ? (
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="h-10 flex-1"
                    placeholder="Tu nombre completo"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 rounded-lg border border-border/60 bg-muted/40 px-3 h-10 flex items-center text-sm font-medium">
                    {displayName}
                  </div>
                )}
                <Button
                  onClick={() => {
                    if (isEditing) {
                      setDisplayName(originalDisplayName);
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                Correo electronico
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3 h-10 flex items-center text-sm font-mono text-muted-foreground truncate">
                  {currentUser.email}
                </div>
                <Button
                  onClick={handleCopyEmail}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 shrink-0 transition-colors",
                    copiedEmail && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  )}
                >
                  {copiedEmail ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row">
                <Button
                  onClick={handleSaveChanges}
                  disabled={saving || displayName.trim() === ""}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelChanges}
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="space-y-1">
            <CardTitle>Cuenta y acceso</CardTitle>
            <CardDescription>
              Gestiona la sesion activa en este dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 text-left text-sm text-muted-foreground">
              Cierra sesion si compartes este equipo o utilizas un dispositivo
              publico. Tus cambios se mantendran sincronizados cuando vuelvas a
              iniciar sesion.
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isCropping}
        onOpenChange={(open) => {
          if (!open) {
            handleCropCancel();
          }
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recorta tu nuevo avatar</DialogTitle>
            <DialogDescription>
              Ajusta la posicion y el zoom para centrar la imagen.
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-black/80">
            {croppingImage && (
              <Cropper
                image={croppingImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) =>
                  setCroppedAreaPixels(areaPixels)
                }
              />
            )}
          </div>
          <div className="space-y-3 pt-4">
            <Label
              htmlFor="avatar-zoom"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Zoom
            </Label>
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-primary"
              disabled={uploading}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={handleCropCancel}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCropConfirm}
              disabled={uploading || !croppedAreaPixels}
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Guardando
                </>
              ) : (
                "Aplicar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo crear el contexto del lienzo");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("No se pudo generar la imagen recortada"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error: Event | string) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}
