<?php

namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
/**
 * Index controller.
 *
 * @Route("/admin")
 */
class AdminController extends Controller
{
/**
 * @Route("/", name="wwwconf_index")
 * @Template()
 */
    public function indexAction()
    {
        return array();
    }
}
