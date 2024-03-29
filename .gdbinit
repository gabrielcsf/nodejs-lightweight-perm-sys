# Copyright 2014 the V8 project authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Print HeapObjects.
define job
call _v8_internal_Print_Object((void*)($arg0))
end
document job
Print a v8 JavaScript object
Usage: job tagged_ptr
end

# Print v8::Local handle value.
define jlh
call _v8_internal_Print_Object(*((v8::internal::Object**)($arg0).val_))
end
document jlh
Print content of a v8::Local handle
Usage: jlh local_handle
end

# Print Code objects containing given PC.
define jco
call _v8_internal_Print_Code((void*)($arg0))
end
document jco
Print a v8 Code object from an internal code address
Usage: jco pc
end

# Print FeedbackVector
define jfv
call _v8_internal_Print_FeedbackVector((void*)($arg0))
end
document jfv
Print a v8 FeedbackVector object
Usage: jfv tagged_ptr
end

# Print FeedbackMetadata
define jfm
call _v8_internal_Print_FeedbackMetadata((void*)($arg0))
end
document jfm
Print a v8 FeedbackMetadata object
Usage: jfm tagged_ptr
end


# Print DescriptorArray.
define jda
call _v8_internal_Print_DescriptorArray((void*)($arg0))
end
document jda
Print a v8 DescriptorArray object
Usage: jda tagged_ptr
end

# Print LayoutDescriptor.
define jld
call _v8_internal_Print_LayoutDescriptor((void*)($arg0))
end
document jld
Print a v8 LayoutDescriptor object
Usage: jld tagged_ptr
end

# Print TransitionArray.
define jta
call _v8_internal_Print_TransitionArray((void*)($arg0))
end
document jta
Print a v8 TransitionArray object
Usage: jta tagged_ptr
end

# Print TransitionTree.
define jtt
call _v8_internal_Print_TransitionTree((void*)($arg0))
end
document jtt
Print the complete transition tree of the given v8 Map.
Usage: jtt tagged_ptr
end

# Print JavaScript stack trace.
define jst
call _v8_internal_Print_StackTrace()
end
document jst
Print the current JavaScript stack trace
Usage: jst
end

# Skip the JavaScript stack.
define jss
set $js_entry_sp=v8::internal::Isolate::Current()->thread_local_top()->js_entry_sp_
set $rbp=*(void**)$js_entry_sp
set $rsp=$js_entry_sp + 2*sizeof(void*)
set $pc=*(void**)($js_entry_sp+sizeof(void*))
end
document jss
Skip the jitted stack on x64 to where we entered JS last.
Usage: jss
end

# Print stack trace with assertion scopes.
define bta
python
import re
frame_re = re.compile("^#(\d+)\s*(?:0x[a-f\d]+ in )?(.+) \(.+ at (.+)")
assert_re = re.compile("^\s*(\S+) = .+<v8::internal::Per\w+AssertType::(\w+)_ASSERT, (false|true)>")
btl = gdb.execute("backtrace full", to_string = True).splitlines()
for l in btl:
  match = frame_re.match(l)
  if match:
    print("[%-2s] %-60s %-40s" % (match.group(1), match.group(2), match.group(3)))
  match = assert_re.match(l)
  if match:
    if match.group(3) == "false":
      prefix = "Disallow"
      color = "\033[91m"
    else:
      prefix = "Allow"
      color = "\033[92m"
    print("%s -> %s %s (%s)\033[0m" % (color, prefix, match.group(2), match.group(1)))
end
end
document bta
Print stack trace with assertion scopes
Usage: bta
end

# Search for a pointer inside all valid pages.
define space_find
  set $space = $arg0
  set $current_page = $space->anchor()->next_page()
  while ($current_page != $space->anchor())
    printf "#   Searching in %p - %p\n", $current_page->area_start(), $current_page->area_end()-1
    find $current_page->area_start(), $current_page->area_end()-1, $arg1
    set $current_page = $current_page->next_page()
  end
end

define heap_find
  set $heap = v8::internal::Isolate::Current()->heap()
  printf "# Searching for %p in old_space  ===============================\n", $arg0
  space_find $heap->old_space() ($arg0)
  printf "# Searching for %p in map_space  ===============================\n", $arg0
  space_find $heap->map_space() $arg0
  printf "# Searching for %p in code_space ===============================\n", $arg0
  space_find $heap->code_space() $arg0
end
document heap_find
Find the location of a given address in V8 pages.
Usage: heap_find address
end

set disassembly-flavor intel
