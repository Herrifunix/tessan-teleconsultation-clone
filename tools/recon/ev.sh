#!/usr/bin/env bash
# Envoie un extrait JS au pilote : tools/recon/ev.sh 'return await page.title()'
curl -s -X POST --data-binary "${1:-$(cat)}" http://127.0.0.1:9333/eval; echo
