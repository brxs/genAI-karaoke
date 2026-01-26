-- CreateTable
CREATE TABLE "presentations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "absurdity" INTEGER NOT NULL,
    "custom_style_prompt" TEXT,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slides" (
    "id" TEXT NOT NULL,
    "presentation_id" TEXT NOT NULL,
    "slide_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "bullet_points" TEXT[],
    "image_prompt" TEXT,
    "image_url" TEXT,
    "image_error" TEXT,
    "is_title_slide" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presentations_user_id_idx" ON "presentations"("user_id");

-- CreateIndex
CREATE INDEX "presentations_updated_at_idx" ON "presentations"("updated_at" DESC);

-- CreateIndex
CREATE INDEX "slides_presentation_id_idx" ON "slides"("presentation_id");

-- CreateIndex
CREATE INDEX "slides_presentation_id_slide_number_idx" ON "slides"("presentation_id", "slide_number");

-- AddForeignKey
ALTER TABLE "slides" ADD CONSTRAINT "slides_presentation_id_fkey" FOREIGN KEY ("presentation_id") REFERENCES "presentations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
