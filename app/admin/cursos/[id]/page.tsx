import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Eye, KeyRound, PackagePlus, Users } from "lucide-react";

import { CourseEnrollmentsPanel } from "@/components/admin/course-enrollments-panel";
import { CoursePaymentProofsPanel } from "@/components/admin/course-payment-proofs-panel";
import { CoursePaymentSettingsPanel } from "@/components/admin/course-payment-settings-panel";
import { CourseStorefrontSettingsPanel } from "@/components/admin/course-storefront-settings-panel";
import CourseContentTab from "@/components/admin/course-editor/CourseContentTab";
import { PageHeader } from "@/components/layout/page-header";
import { getCourseContent } from "@/lib/courses/repository";
import { getCourseStorefrontSettings } from "@/lib/courses/storefront";
import { listStudentProfiles } from "@/lib/engines/auth/repository";
import { requireUser } from "@/lib/engines/auth/helpers";
import { listCourseEnrollments } from "@/lib/engines/learning/enrollments";
import { getCoursePaymentSettings, listCoursePaymentProofs } from "@/lib/engines/learning/manual-payments";

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  const { id } = await params;
  const ownerId = auth.profile.role === "admin" ? undefined : auth.user.id;
  const course = await getCourseContent(id, ownerId);

  if (!course) {
    notFound();
  }

  const [enrollments, students, paymentSettings, paymentProofs, storefrontSettings] = await Promise.all([
    listCourseEnrollments(course.id),
    listStudentProfiles(),
    getCoursePaymentSettings(course.id),
    listCoursePaymentProofs(auth, course.id),
    getCourseStorefrontSettings(course.id)
  ]);
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Editor de curso"
        title={course.title}
        meta={`${course.isPublished ? "Publicado" : "Draft"} - ${course.modules.length} modulos - ${lessonCount} lecciones`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="#students" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
              <Users aria-hidden className="h-4 w-4" />
              Manage students
            </Link>
            <Link href="#access" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-surface-base px-3 py-2 text-sm font-semibold text-ink-secondary shadow-soft">
              <KeyRound aria-hidden className="h-4 w-4" />
              Manage access
            </Link>
          </div>
        }
      />
      <section className="grid gap-3 md:grid-cols-4">
        <CourseOperationLink href="#content" icon={BookOpen} title="Contenido" detail={`${lessonCount} lecciones`} />
        <CourseOperationLink href="#students" icon={Users} title="Alumnos" detail={`${enrollments.length} enrollments`} />
        <CourseOperationLink href="#access" icon={KeyRound} title="Acceso" detail={paymentSettings.paymentType} />
        <CourseOperationLink href="#storefront" icon={Eye} title="Storefront" detail={storefrontSettings.showOnLanding ? "Visible" : "Oculto"} />
      </section>
      <section className="rounded-lg border border-line-subtle bg-surface-base p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
            <PackagePlus aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink-primary">Producto vinculado</h2>
            <p className="mt-1 text-sm leading-6 text-ink-secondary">
              Este curso ya esta respaldado por su producto interno. La creacion de productos separados no es necesaria para este MVP.
            </p>
          </div>
        </div>
      </section>
      <section id="content"><CourseContentTab courseId={course.id} /></section>
      <section id="storefront"><CourseStorefrontSettingsPanel settings={storefrontSettings} /></section>
      <section id="access"><CoursePaymentSettingsPanel settings={paymentSettings} /></section>
      <section id="payments"><CoursePaymentProofsPanel courseId={course.id} proofs={paymentProofs} /></section>
      <section id="students"><CourseEnrollmentsPanel courseId={course.id} students={students} enrollments={enrollments} /></section>
    </section>
  );
}

function CourseOperationLink({
  detail,
  href,
  icon: Icon,
  title
}: {
  detail: string;
  href: string;
  icon: typeof BookOpen;
  title: string;
}) {
  return (
    <Link href={href} className="rounded-lg border border-line-subtle bg-surface-base p-4 shadow-soft transition hover:border-brand-primary/40 hover:bg-surface-muted">
      <Icon aria-hidden className="h-5 w-5 text-brand-primary" />
      <h2 className="mt-3 text-sm font-semibold text-ink-primary">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </Link>
  );
}
