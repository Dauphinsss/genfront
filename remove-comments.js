const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/components/admin/UsersManagement.tsx',
  'src/components/profile/ProfileView.tsx',
  'src/components/teacher/TopicsView.tsx',
  'src/components/course_base/course-base-units.tsx',
  'src/lib/image-utils.ts',
  'src/components/AuthenticatedAvatar.tsx',
  'src/components/header.tsx',
  'src/app/api/image-proxy/route.ts',
  'src/services/units.ts',
  'src/services/lessons.ts',
  'src/services/courseBase.ts',
  'src/services/topics.ts',
  'src/components/ui/toast.tsx',
  'src/components/teacher/TopicEditor.tsx',
  'src/components/dashboard.tsx',
  'src/app/layout.tsx',
  'src/app/login/LoginCallback.tsx',
  'src/app/page.tsx',
  'src/lib/course-context.tsx',
  'src/components/teacher/CreateTopicModal.tsx',
  'src/components/course_base/lesson-page.tsx',
  'src/lib/icons.ts',
  'src/components/ui/sidebar.tsx',
  'src/components/textCircleFollower.tsx',
  'src/components/teacher/TopicPreview.tsx',
  'src/components/sidebar.tsx',
  'src/lib/tiptap-extensions/resizable-image.tsx'
];

const directivesPattern = /^[\s]*("|')use (client|server)("|');?\s*$/;
const eslintPattern = /^[\s]*\/\/\s*eslint-/;

function removeComments(content) {
  let result = content;
  let commentsRemoved = 0;

  result = result.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
    const beforeMatch = result.substring(0, offset);
    const lastNewline = beforeMatch.lastIndexOf('\n');
    const lineStart = lastNewline + 1;
    const lineContent = beforeMatch.substring(lineStart);

    if (lineContent.trim() === '') {
      const afterMatch = result.substring(offset + match.length);
      const nextNewline = afterMatch.indexOf('\n');
      const afterContent = afterMatch.substring(0, nextNewline >= 0 ? nextNewline : afterMatch.length);

      if (afterContent.trim() === '') {
        commentsRemoved++;
        return '';
      }
    }

    commentsRemoved++;
    return '';
  });

  result = result.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => {
    commentsRemoved++;
    return '';
  });

  const lines = result.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (directivesPattern.test(line)) {
      processedLines.push(line);
      continue;
    }

    if (eslintPattern.test(line)) {
      processedLines.push(line);
      continue;
    }

    const commentIndex = line.indexOf('//');
    if (commentIndex !== -1) {
      const beforeComment = line.substring(0, commentIndex);
      const singleQuotes = (beforeComment.match(/'/g) || []).length;
      const doubleQuotes = (beforeComment.match(/"/g) || []).length;
      const backticks = (beforeComment.match(/`/g) || []).length;

      if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0 && backticks % 2 === 0) {
        const trimmedBefore = beforeComment.trimEnd();
        if (trimmedBefore.length > 0) {
          processedLines.push(trimmedBefore);
        }
        commentsRemoved++;
        continue;
      }
    }

    processedLines.push(line);
  }

  result = processedLines.join('\n');

  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');

  return { content: result, removed: commentsRemoved };
}

let totalFiles = 0;
let totalComments = 0;
const modifiedFiles = [];

for (const file of filesToProcess) {
  const filePath = path.join(__dirname, file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - file not found`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, removed } = removeComments(content);

    if (removed > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles.push(file);
      totalComments += removed;
      totalFiles++;
      console.log(`✓ ${file} - ${removed} comments removed`);
    } else {
      console.log(`○ ${file} - no comments found`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Files processed: ${totalFiles}`);
console.log(`Comments removed: ${totalComments}`);
console.log(`\nModified files:`);
modifiedFiles.forEach(file => console.log(`  - ${file}`));
