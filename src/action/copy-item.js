'use server'

import { copyFile } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

import { ROOT, HOME_DIRECTORY } from 'library/constants'
import { checkItemExistance } from 'library/server/helper'

export default async function copyItemAction(
  source,
  destination,
  replaceConfirmation,
  duplicateConfirmation,
) {
  const srcFullPath = path.join(process.cwd(), ROOT, HOME_DIRECTORY, source)
  let destFullPath = path.join(process.cwd(), ROOT, HOME_DIRECTORY, destination)
  const parsedSrcFullPath = path.parse(srcFullPath)
  const confirmation = replaceConfirmation || duplicateConfirmation

  if (!confirmation) {
    const destFullPathWithItemName = path.join(
      destFullPath,
      parsedSrcFullPath.base,
    )
    const isItemExist = await checkItemExistance(destFullPathWithItemName)

    if (isItemExist) return { exist: true }
  }

  destFullPath = path.join(
    destFullPath,
    duplicateConfirmation
      ? `${parsedSrcFullPath.name}-copy${parsedSrcFullPath.ext}`
      : parsedSrcFullPath.base,
  )
  try {
    await copyFile(srcFullPath, destFullPath)
    revalidatePath('/')
  } catch (err) {
    console.log(err)
  }

  return null
}
