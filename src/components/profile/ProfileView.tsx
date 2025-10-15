"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, User, Mail, Copy, Check, LogOut } from "lucide-react";
import { updateProfile } from "@/services/profile";

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
  const [originalUser, setOriginalUser] = useState(user);
  const [originalDisplayName, setOriginalDisplayName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("pyson_token") || ""
      : "";

  useEffect(() => {
    setOriginalUser(user);
    setOriginalDisplayName(user.name);
    setCurrentUser(user);
    setDisplayName(user.name);
  }, [user]);

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imágenes JPG, PNG, WebP o GIF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen debe ser menor a 10MB");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("pyson_token");

      const response = await fetch("http://localhost:4000/api/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.user) {
        const updatedUser = {
          ...currentUser,
          avatar: result.user.avatar,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("pyson_user", JSON.stringify(updatedUser));
        onUserUpdate(updatedUser);
        setAvatarPreview(null);
      } else {
        alert("Error al subir avatar: " + (result.message || ""));
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión al subir avatar");
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updatedProfile = await updateProfile(token, { name: displayName });
      setCurrentUser(updatedProfile);
      setDisplayName(updatedProfile.name);
      localStorage.setItem("pyson_user", JSON.stringify(updatedProfile));
      onUserUpdate(updatedProfile);

      setOriginalUser(updatedProfile);
      setOriginalDisplayName(displayName);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setCurrentUser(originalUser);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto py-4  sm:py-8 sm:px-6 lg:px-8">
        

        {/* Profile Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Información de la cuenta
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tus datos personales
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="gap-1.5 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs">Activo</span>
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 shadow-sm ring-2 ring-background rounded-full overflow-hidden bg-muted relative">
                    {uploading ? (
                      <Skeleton className="w-full h-full rounded-full" />
                    ) : currentUser.avatar || avatarPreview ? (
                      <>
                        <Image
                          src={avatarPreview || currentUser.avatar}
                          alt={currentUser.name}
                          fill
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-cover"
                          priority
                          onLoadingComplete={() =>
                            console.log("Avatar loaded successfully")
                          }
                          onError={() => {
                            console.error(
                              "Error loading avatar:",
                              currentUser.avatar
                            );
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg sm:text-xl">
                        {getInitials(currentUser.name)}
                      </div>
                    )}
                  </div>

                  <Button
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg hover:scale-105 hover:rotate-12"
                    disabled={uploading}
                    asChild
                  >
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPickAvatar}
                        disabled={uploading}
                      />
                    </label>
                  </Button>
                </div>
              </div>

              {/* Information Section */}
              <div className="flex-1 space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Nombre completo
                  </Label>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Input
                        id="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-9 sm:h-10"
                        placeholder="Tu nombre completo"
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 px-3 py-2 sm:py-2.5 rounded-md bg-muted/50 border text-sm font-medium">
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
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 sm:h-10 sm:w-10 ${
                        isEditing ? "bg-muted" : ""
                      }`}
                    >
                      <Pencil
                        className={`h-4 w-4 transition-transform ${
                          isEditing ? "rotate-12" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Correo electrónico
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 sm:py-2.5 rounded-md bg-muted/50 border text-xs sm:text-sm font-mono truncate text-muted-foreground">
                      {currentUser.email}
                    </div>
                    <Button
                      onClick={handleCopyEmail}
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 sm:h-10 sm:w-10 ${
                        copiedEmail ? "bg-green-50 dark:bg-green-950/30" : ""
                      }`}
                    >
                      {copiedEmail ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <>
                    <Separator />
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                      <Button
                        onClick={handleSaveChanges}
                        disabled={saving || displayName.trim() === ""}
                        className="flex-1"
                        
                      >
                        {saving ? (
                          <>
                            <div className="mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
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
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Separator className="my-6" />

        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </>
  );
}
